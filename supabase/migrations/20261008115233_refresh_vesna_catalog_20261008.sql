-- Replace the synthetic starter catalog with the new 12-product collection.
-- Existing products are kept for historical clicks and can be reactivated later.
begin;

update public.products
set is_active = false, updated_at = now()
where is_active = true;

insert into public.products (
  slug, name, description, price, sale_price, affiliate_link, category_id,
  image_urls, why_victory, item_type, is_featured, is_active
)
select
  p.slug, p.name, p.description, p.price, p.sale_price, p.shop_url,
  c.id, p.image_urls, p.why_victory, 'shop', p.is_featured, true
from (values
  ('logitech-mx-master-4','Logitech MX Master 4','Wireless ergonomic mouse with customizable controls and haptic feedback. Price checked 8 Oct 2026 (USD).',119.99::numeric,null::numeric,'https://www.logitech.com/en-us/shop/p/mx-master-4.910-007560','tech',array['https://resource.logitech.com/w_544%2Ch_466%2Car_7%3A6%2Cc_pad%2Cq_auto%2Cf_auto%2Cdpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-4/gallery/mx-master-4-black-top-angle-gallery-1.png']::text[],'A precise, comfortable pointer built for long hours and deliberate workflows.',true),
  ('anker-prime-charger-100w','Anker Prime Charger (100W, 3 Ports)','Compact 100W GaN charger with two USB-C ports and one USB-A port. Price checked 8 Oct 2026 (USD).',69.99::numeric,null::numeric,'https://www.anker.com/products/a2688-anker-prime-charger-100w-3-ports-gan','tech',array['https://cdn.shopify.com/s/files/1/0493/9834/9974/files/A2688141_Rich_image_TD01_US_2000x2000px_V1-removebg-preview.png?v=1737944482&width=3840']::text[],'One compact charger can cover a laptop and smaller devices without a tangle of adapters.',false),
  ('sony-wh-1000xm6','Sony WH-1000XM6','Over-ear wireless noise-cancelling headphones. Price checked 8 Oct 2026 (USD); Sony showed $378 sale from $459.99 MSRP.',459.99::numeric,378.00::numeric,'https://electronics.sony.com/audio/headphones/headband/p/wh1000xm6-b','audio',array['https://www.pcrichard.com/dw/image/v2/BFXM_PRD/on/demandware.static/-/Sites-pcrichard-master-product-catalog/default/dw1f097e56/images/hires/AZ4_WH1000XM6-B.jpg?sh=800&sm=fit&sw=800']::text[],'A travel-friendly listening pick with adaptive noise cancellation and a foldable design.',true),
  ('sonos-era-100','Sonos Era 100','Wi-Fi and Bluetooth smart speaker with stereo playback. Price checked 8 Oct 2026 (USD).',219.00::numeric,null::numeric,'https://www.sonos.com/en-us/shop/era-100','audio',array['https://media.sonos.com/images/znqtjj88/production/56c1865fb5086b5d48720d8af1a5116ebd19afdb-2000x2000.png?auto=format&fit=clip&q=100&w=3840']::text[],'A room-filling speaker that fits easily into a considered home audio setup.',false),
  ('hydro-flask-24oz-wide-mouth','Hydro Flask 24 oz Wide Mouth with Flex Straw Cap','Insulated stainless-steel bottle with a flexible straw cap. Price checked 8 Oct 2026 (USD).',44.95::numeric,null::numeric,'https://www.hydroflask.com/24-oz-wide-mouth-with-flex-straw-cap','lifestyle',array['https://www.hydroflask.com/media/catalog/product/cache/b2f1ce2dfe10d3d31bf2056bf6e0d10f/W/2/W24CFS527-24-OZ-WIDE-FLEX-STRAW-CAP-UTOPIA-PURPLE-Straight.jpg']::text[],'A durable everyday bottle with useful one-handed sipping for commutes and walks.',true),
  ('hatch-restore-3','Hatch Restore 3','Bedside sunrise alarm and sound machine designed to support a consistent wind-down routine. Price checked 8 Oct 2026 (USD).',169.99::numeric,null::numeric,'https://www.hatch.co/restore','lifestyle',array['https://www.hatch.co/_next/image?q=100&url=https%3A%2F%2Fwww.datocms-assets.com%2F98401%2F1735102111-restore-3-putty-carousel-6.png&w=1080']::text[],'A bedside ritual tool that brings light and sound into one simple routine.',false),
  ('benq-screenbar-halo-2','BenQ ScreenBar Halo 2','Monitor light with adjustable front illumination and rear ambient light. Price checked 8 Oct 2026 (USD).',199.00::numeric,null::numeric,'https://www.benq.com/en-us/lighting/monitor-light/screenbar-halo-2.html','workspace',array['https://image.benq.com/is/image/benqco/comprehensive-lighting?%24ResponsivePreset%24=']::text[],'An uncluttered way to add adjustable task lighting without taking desk space.',true),
  ('logitech-mx-keys-s','Logitech MX Keys S','Wireless low-profile keyboard with smart backlighting. Price checked 8 Oct 2026 (USD).',129.99::numeric,null::numeric,'https://www.logitech.com/en-us/shop/p/mx-keys-s.920-011559','workspace',array['https://resource.logitech.com/content/dam/logitech/en/products/keyboards/mx-keys-s/migration-assets-for-delorean-2025/gallery/mx-keys-s-top-view-graphite-ch.png']::text[],'A quiet, low-profile keyboard designed for comfortable focused work.',false),
  ('peak-design-travel-backpack-45l','Peak Design Travel Backpack 45L','Expandable carry-on travel backpack with adjustable capacity. Price checked 8 Oct 2026 (USD).',299.95::numeric,null::numeric,'https://www.peakdesign.com/products/travel-backpack?Color=Black&Size=45L','travel',array['https://cdn.shopify.com/s/files/1/2986/1172/files/Travel-Backpack-45-Coyote-2.jpg?crop=center&height=2048&v=1738045775&width=2048']::text[],'A flexible carry-on for trips where one organized bag makes packing simpler.',true),
  ('cotopaxi-allpa-35l','Cotopaxi Allpa 35L Travel Pack','35-liter travel pack with suitcase-style opening and internal organization. Price checked 8 Oct 2026 (USD).',230.00::numeric,null::numeric,'https://www.cotopaxi.com/products/allpa-35l-travel-pack-4','travel',array['https://shop-orange.info/cdn/shop/files/1043-0012_7_1800x1800.jpg?v=1756884702']::text[],'A carry-on-sized pack with compartments that make travel essentials easier to reach.',false),
  ('fellow-stagg-ekg-kettle','Fellow Stagg EKG Electric Kettle','Electric pour-over kettle with variable temperature control and a precision gooseneck spout. Price checked 8 Oct 2026 (USD).',199.95::numeric,169.95::numeric,'https://fellowproducts.com/collections/bestsellers/products/stagg-ekg-electric-pour-over-kettle','home',array['https://fellowproducts.com/cdn/shop/files/Web_PDP_StaggEKGElectricKettle-Pro_DesertRose_Maple_1.png?v=1773351258&width=1200']::text[],'A focused brewing tool for a slower, more measured morning coffee ritual.',true),
  ('ember-mug-2-10oz','Ember Mug 2 (10 oz)','Temperature-control smart mug with charging coaster. Price checked 8 Oct 2026 (USD); current listed sale $89.99 from $149.95.',149.95::numeric,89.99::numeric,'https://ember.com/collections/ember-mugs/products/ember-mug-2','home',array['https://ember.com/cdn/shop/files/ember_CM1914_00-black.jpg?v=1684887895&width=1920']::text[],'Keeps a favorite hot drink at a chosen temperature through a longer reading or work session.',false)
) as p(slug,name,description,price,sale_price,shop_url,category_slug,image_urls,why_victory,is_featured)
join public.categories c on c.slug = p.category_slug
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  sale_price = excluded.sale_price,
  affiliate_link = excluded.affiliate_link,
  category_id = excluded.category_id,
  image_urls = excluded.image_urls,
  why_victory = excluded.why_victory,
  item_type = excluded.item_type,
  is_featured = excluded.is_featured,
  is_active = true,
  updated_at = now();

commit;
