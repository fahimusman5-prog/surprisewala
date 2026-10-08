import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// This command only generates reviewable SQL. It never connects to a database.
const snapshotPath = new URL("../src/data/storefront-seed.json", import.meta.url);
const outputPath = new URL("../supabase/seed-cms.sql", import.meta.url);
const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
const definitions = {
  collections: "id uuid,name text,slug text,short_description text,cover_image text,active boolean,featured boolean,display_order integer,archived_at timestamptz",
  packages: "id text,slug text,name text,badge text,description text,price numeric,price_note text,main_image text,video_url text,video_orientation text,order_mode text,active boolean,featured boolean,display_order integer,archived_at timestamptz",
  package_items: "id uuid,package_id text,label text,display_order integer",
  package_images: "id uuid,package_id text,image_path text,alt_text text,display_order integer",
  gallery_items: "id uuid,image_path text,media_type text,title text,caption text,active boolean,featured boolean,display_order integer,archived_at timestamptz",
  reviews: "id uuid,customer_name text,review text,rating integer,customer_image text,package_id text,published boolean,featured boolean,display_order integer",
  site_statistics: "id uuid,key text,label text,value numeric,suffix text,active boolean,display_order integer",
  site_settings: "key text,value text",
};
const columns = (definition) => definition.split(",").map((field) => field.trim().split(" ")[0]).join(",");
const jsonSql = (rows) => `$sw_seed$${JSON.stringify(rows)}$sw_seed$::jsonb`;
let sql = `-- Generated from the audited existing storefront by scripts/generate-cms-seed.mjs.
-- Intended project ONLY: pzjbfhwzaettkzaxjdte. No auth/customer/order records are seeded.
-- Before this transaction, verify the project in Supabase and explicitly run:
-- select set_config('surprisewala.confirmed_project_ref','pzjbfhwzaettkzaxjdte',false);
-- The confirmation is an execution guard, not a substitute for the live identity/schema audit.
begin;
do $$ begin
  if current_setting('surprisewala.confirmed_project_ref',true) is distinct from 'pzjbfhwzaettkzaxjdte' then
    raise exception 'Verify the Surprisewala project before running this seed.';
  end if;
end $$;
create temporary table _sw_seed_modules (module text primary key, initially_empty boolean) on commit drop;
create temporary table _sw_seed_new_packages (id text primary key) on commit drop;
`;
for (const name of ["collections", "packages", "gallery_items", "reviews", "site_statistics", "site_settings"]) {
  sql += `insert into _sw_seed_modules values ('${name}',not exists(select 1 from public.${name}));\n`;
}
for (const name of ["collections", "packages", "package_items", "package_images", "gallery_items", "reviews", "site_statistics", "site_settings"]) {
  const definition = definitions[name];
  const cols = columns(definition);
  const from = `jsonb_to_recordset(${jsonSql(snapshot[name])}) as seed(${definition})`;
  const condition = ["package_items", "package_images"].includes(name)
    ? "exists(select 1 from _sw_seed_new_packages p where p.id=seed.package_id)"
    : name === "site_settings"
      ? "true" // Missing setting keys can be added; conflicts never overwrite values.
      : `(select initially_empty from _sw_seed_modules where module='${name}')`;
  const statement = `insert into public.${name} (${cols}) select ${cols.split(",").map((field) => `seed.${field}`).join(",")} from ${from} where ${condition} on conflict do nothing`;
  sql += name === "packages"
    ? `with inserted as (${statement} returning id) insert into _sw_seed_new_packages select id from inserted;\n`
    : `${statement};\n`;
}
const collectionSlugs = new Map(snapshot.collections.map((collection) => [collection.id, collection.slug]));
const links = snapshot.package_collections.map((link) => ({ package_id: link.package_id, collection_slug: collectionSlugs.get(link.collection_id) }));
sql += `insert into public.package_collections (package_id,collection_id)
select seed.package_id,c.id from jsonb_to_recordset(${jsonSql(links)}) as seed(package_id text,collection_slug text)
join public.collections c on c.slug=seed.collection_slug
join _sw_seed_new_packages p on p.id=seed.package_id
on conflict do nothing;
-- CMS stays disabled. Verify assets, permissions, orders and moderation first.
-- Existing testimonials are deliberately unpublished until their provenance is confirmed.
commit;
`;
writeFileSync(outputPath, sql);
console.log(`Generated ${fileURLToPath(outputPath)}. No database connection was made.`);
