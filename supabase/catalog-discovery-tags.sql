-- Editorial discovery labels derived from the current name/description and curator notes.
-- Labels describe suitability; they do not verify new specifications or seller claims.
-- Preserve manual metadata and skip changed, inactive or archived listings.
with source(slug,reviewed_name,reviewed_description,uses,interests) as (values
('acoustic-guitar-limited','Acoustic Guitar (Limited)','Solid rosewood. Only 50 made worldwide.',array['acoustic guitar playing']::text[],array['music']::text[]),
('anker-prime-charger-100w','Anker Prime Charger (100W, 3 Ports)','Compact 100W GaN charger with two USB-C ports and one USB-A port. Price checked 8 Oct 2026 (USD).',array['device charging','laptop charging']::text[],array['technology','workspace','travel']::text[]),
('artisan-coffee-subscription','Artisan Coffee Subscription','Single-origin, small-batch roasted. Delivered weekly.',array['coffee subscription']::text[],array['coffee']::text[]),
('benq-screenbar-halo-2','BenQ ScreenBar Halo 2','Monitor light with adjustable front illumination and rear ambient light. Price checked 8 Oct 2026 (USD).',array['monitor lighting','desk lighting']::text[],array['workspace','technology']::text[]),
('canvas-tote','Canvas Tote','Heavy-duty canvas. Vegetable-tanned leather straps.',array['everyday carrying']::text[],array['bags']::text[]),
('cotopaxi-allpa-35l','Cotopaxi Allpa 35L Travel Pack','35-liter travel pack with suitcase-style opening and internal organization. Price checked 8 Oct 2026 (USD).',array['travel packing','carrying luggage']::text[],array['travel']::text[]),
('ember-mug-2-10oz','Ember Mug 2 (10 oz)','Temperature-control smart mug with charging coaster. Price checked 8 Oct 2026 (USD); current listed sale $89.99 from $149.95.',array['hot drink temperature control']::text[],array['coffee','hot drinks']::text[]),
('fellow-stagg-ekg-kettle','Fellow Stagg EKG Electric Kettle','Electric pour-over kettle with variable temperature control and a precision gooseneck spout. Price checked 8 Oct 2026 (USD).',array['pour-over coffee brewing','water heating']::text[],array['coffee','kitchenware']::text[]),
('hatch-restore-3','Hatch Restore 3','Bedside sunrise alarm and sound machine designed to support a consistent wind-down routine. Price checked 8 Oct 2026 (USD).',array['sunrise alarm','bedside wind-down routine']::text[],array['home routines']::text[]),
('heirloom-recipe-book','Heirloom Recipe Book','Archival paper. Lay-flat binding. Pass it down.',array['recipe keeping']::text[],array['cooking','kitchenware']::text[]),
('hydro-flask-24oz-wide-mouth','Hydro Flask 24 oz Wide Mouth with Flex Straw Cap','Insulated stainless-steel bottle with a flexible straw cap. Price checked 8 Oct 2026 (USD).',array['carrying drinking water','everyday hydration']::text[],array['commuting','walking']::text[]),
('indoor-herb-garden-kit','Indoor Herb Garden Kit','Self-watering. LED grow light. Basil, mint, and thyme seeds.',array['indoor herb growing']::text[],array['gardening','houseplants']::text[]),
('kombucha-brewing-kit','Kombucha Brewing Kit','Continuous brew system. SCOBY included. Makes 2 gallons.',array['kombucha brewing','home fermentation']::text[],array['kombucha']::text[]),
('leather-weekender-bag','Leather Weekender Bag','The perfect travel companion, ages beautifully.',array['carrying luggage']::text[],array['travel','bags']::text[]),
('logitech-mx-keys-s','Logitech MX Keys S','Wireless low-profile keyboard with smart backlighting. Price checked 8 Oct 2026 (USD).',array['computer typing']::text[],array['workspace','technology']::text[]),
('logitech-mx-master-4','Logitech MX Master 4','Wireless ergonomic mouse with customizable controls and haptic feedback. Price checked 8 Oct 2026 (USD).',array['computer pointer control']::text[],array['workspace','technology']::text[]),
('minimalist-desk-organizer','Minimalist Desk Organizer','Bamboo with magnetic dock. Holds everything cleanly.',array['desk organization']::text[],array['workspace']::text[]),
('noise-canceling-headphones','Noise-Canceling Headphones','40-hour battery. Studio-grade audio. Travel case included.',array['audio listening','noise cancellation']::text[],array['audio','travel']::text[]),
('peak-design-travel-backpack-45l','Peak Design Travel Backpack 45L','Expandable carry-on travel backpack with adjustable capacity. Price checked 8 Oct 2026 (USD).',array['travel packing','carrying luggage']::text[],array['travel']::text[]),
('podcast-excellence-kit','Podcast Excellence Kit','Everything you need for studio-quality audio from home.',array['podcast recording']::text[],array['podcasting','audio']::text[]),
('productivity-planner','Productivity Planner','Day-level planning. Weekly reviews. Quarterly audits.',array['daily planning','weekly reviews']::text[],array['productivity']::text[]),
('resin-art-kit','Resin Art Kit','All tools included. Create your first piece in a weekend.',array['resin art making']::text[],array['arts','crafts']::text[]),
('scented-soy-candle-trio','Scented Soy Candle Trio','Wood wick, coconut wax, and essential oils only.',array['scented candle lighting']::text[],array['home fragrance']::text[]),
('smart-plant-pot','Smart Plant Pot','Self-watering with moisture sensors and app integration.',array['plant watering','moisture monitoring']::text[],array['gardening','houseplants']::text[]),
('sonos-era-100','Sonos Era 100','Wi-Fi and Bluetooth smart speaker with stereo playback. Price checked 8 Oct 2026 (USD).',array['home audio playback']::text[],array['audio','music']::text[]),
('sony-wh-1000xm6','Sony WH-1000XM6','Over-ear wireless noise-cancelling headphones. Price checked 8 Oct 2026 (USD); Sony showed $378 sale from $459.99 MSRP.',array['audio listening','noise cancellation']::text[],array['audio','travel']::text[]),
('the-curators-eye','The Curator''s Eye','Victory''s personal framework for spotting quality.',array['reading about curation']::text[],array['curation','reading']::text[]),
('the-innovation-stack','The Innovation Stack','A blueprint for building systems that scale.',array['reading about systems']::text[],array['systems','reading']::text[]),
('vintage-aviator-sunglasses','Vintage Aviator Sunglasses','Handcrafted acetate with gold-toned hinges.',array['wearing sunglasses']::text[],array['accessories']::text[]),
('vintage-film-camera','Vintage Film Camera','Fully mechanical. No batteries needed. Pure photography.',array['film photography']::text[],array['photography']::text[]),
('wireless-charging-station','Wireless Charging Station','Bamboo base, 3-device charging, cable management.',array['device charging','cable organization']::text[],array['technology','workspace']::text[])
)
update public.products p set
 uses=case when cardinality(p.uses)=0 then s.uses else p.uses end,
 interests=case when cardinality(p.interests)=0 then s.interests else p.interests end
from source s where p.slug=s.slug and p.name=s.reviewed_name
 and coalesce(p.description,'')=s.reviewed_description and p.is_active=true and p.item_type<>'archive'
 and (cardinality(p.uses)=0 or cardinality(p.interests)=0)
returning p.slug,p.uses,p.interests;
