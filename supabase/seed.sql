-- =============================================
-- SEED DATA per a Porta'm - L'Ametlla del Vallès
-- =============================================
-- NOTA: Executa primer les migracions.
-- Les contrasenyes per als usuaris de prova son: "portam2024"
-- Executa les insercions d'usuaris manualment des del panell de Supabase Auth
-- i després actualitza els UUIDs en aquest fitxer.

-- Usuaris de prova (els IDs reals venen de auth.users):
-- Substitueix aquests UUIDs pels que Supabase genera:
-- client_id  = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
-- merchant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
-- rider_id   = 'cccccccc-cccc-cccc-cccc-cccccccccccc'

-- Perfils d'usuari (s'insereixen automàticament via trigger, però actualitzem nom i telèfon)
-- UPDATE public.users SET name = 'Maria García', phone = '+34 600 111 222' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
-- UPDATE public.users SET name = 'Joan Puig', phone = '+34 600 333 444', role = 'merchant' WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
-- UPDATE public.users SET name = 'Pau Rovira', phone = '+34 600 555 666', role = 'rider' WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- =============================================
-- MERCHANTS (comerços)
-- =============================================
-- Pizzeria La Plaça
insert into public.merchants (id, user_id, name, category, description, address, lat, lng, is_open, delivery_fee, min_order, logo_url)
values (
  'merchant-pizza-0000-0000-000000000001',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Pizzeria La Plaça',
  'restaurants',
  'Les millors pizzes artesanals de L''Ametlla del Vallès, fetes amb forn de pedra.',
  'Plaça de la Vila, 5, 08480 L''Ametlla del Vallès',
  41.6823,
  2.2547,
  true,
  1.50,
  12.00,
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
);

-- Farmàcia Central
insert into public.merchants (id, user_id, name, category, description, address, lat, lng, is_open, delivery_fee, min_order, logo_url)
values (
  'merchant-farma-0000-0000-000000000002',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Farmàcia Central',
  'farmacies',
  'Productes de farmàcia, parafarmàcia i cosmètica. Lliurament ràpid al teu domicili.',
  'Carrer Major, 12, 08480 L''Ametlla del Vallès',
  41.6831,
  2.2539,
  true,
  2.00,
  8.00,
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'
);

-- Supermercat Ametlla
insert into public.merchants (id, user_id, name, category, description, address, lat, lng, is_open, delivery_fee, min_order, logo_url)
values (
  'merchant-super-0000-0000-000000000003',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Supermercat Ametlla',
  'supermercats',
  'Tot el que necessites per a la llar. Frescos, congelats i productes de neteja.',
  'Avinguda del Vallès, 23, 08480 L''Ametlla del Vallès',
  41.6815,
  2.2562,
  false,
  1.00,
  15.00,
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'
);

-- =============================================
-- PRODUCTS - Pizzeria La Plaça
-- =============================================
insert into public.products (merchant_id, name, description, price, category, image_url, available) values
(
  'merchant-pizza-0000-0000-000000000001',
  'Pizza Margherita',
  'Tomàquet, mozzarella fresca i alfàbrega. La clàssica de sempre.',
  11.50,
  'Pizzes',
  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
  true
),
(
  'merchant-pizza-0000-0000-000000000001',
  'Pizza Prosciutto',
  'Tomàquet, mozzarella i pernil dolç italià.',
  13.50,
  'Pizzes',
  'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400',
  true
),
(
  'merchant-pizza-0000-0000-000000000001',
  'Pizza Quatre Formatges',
  'Mozzarella, gorgonzola, parmesà i brie. Per als amants del formatge.',
  14.00,
  'Pizzes',
  'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=400',
  true
),
(
  'merchant-pizza-0000-0000-000000000001',
  'Pizza Vegetal',
  'Tomàquet, mozzarella, pebrots, carbassó, ceba i olives.',
  13.00,
  'Pizzes',
  'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
  true
),
(
  'merchant-pizza-0000-0000-000000000001',
  'Amanida Caprese',
  'Tomàquet, mozzarella fresca, alfàbrega i oli d''oliva verge extra.',
  7.50,
  'Amanides',
  'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400',
  true
),
(
  'merchant-pizza-0000-0000-000000000001',
  'Tiramisú casolà',
  'Recepta de la casa, fet cada dia.',
  4.50,
  'Postres',
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
  true
),
(
  'merchant-pizza-0000-0000-000000000001',
  'Coca-Cola 33cl',
  'Beguda refrescant.',
  2.00,
  'Begudes',
  'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
  true
);

-- =============================================
-- PRODUCTS - Farmàcia Central
-- =============================================
insert into public.products (merchant_id, name, description, price, category, image_url, available) values
(
  'merchant-farma-0000-0000-000000000002',
  'Paracetamol 1g (10 comp.)',
  'Analgèsic i antipirètic. Sense recepta.',
  3.20,
  'Analgèsics',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  true
),
(
  'merchant-farma-0000-0000-000000000002',
  'Ibuprofèn 400mg (20 comp.)',
  'Antiinflamatori i analgèsic. Sense recepta.',
  4.50,
  'Analgèsics',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  true
),
(
  'merchant-farma-0000-0000-000000000002',
  'Crema solar SPF50+ 200ml',
  'Protecció solar alta per a tota la família.',
  12.90,
  'Solar',
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
  true
),
(
  'merchant-farma-0000-0000-000000000002',
  'Gel hidroalcohòlic 500ml',
  'Desinfectant de mans amb 70% d''alcohol.',
  5.50,
  'Higiene',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  true
),
(
  'merchant-farma-0000-0000-000000000002',
  'Mascaretes FFP2 (pack 5 u.)',
  'Mascaretes de alta protecció, CE certificat.',
  6.90,
  'Higiene',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  true
),
(
  'merchant-farma-0000-0000-000000000002',
  'Vitamina C 1000mg (30 comp.)',
  'Reforç del sistema immunològic.',
  8.50,
  'Vitamines',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  true
),
(
  'merchant-farma-0000-0000-000000000002',
  'Termòmetre digital',
  'Mesura de temperatura corporal amb lectura ràpida.',
  9.90,
  'Aparells',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  true
);

-- =============================================
-- PRODUCTS - Supermercat Ametlla
-- =============================================
insert into public.products (merchant_id, name, description, price, category, image_url, available) values
(
  'merchant-super-0000-0000-000000000003',
  'Pa de motlle integral',
  'Pa de motlle 100% integral. 500g.',
  1.85,
  'Pa i cereals',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  true
),
(
  'merchant-super-0000-0000-000000000003',
  'Llet semidesnatada 1L',
  'Llet pasteuritzada de vaca semidesnatada.',
  0.99,
  'Làctics',
  'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
  true
),
(
  'merchant-super-0000-0000-000000000003',
  'Iogurt natural (pack 4 u.)',
  'Iogurt natural sense sucre afegit.',
  1.45,
  'Làctics',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
  true
),
(
  'merchant-super-0000-0000-000000000003',
  'Tomàquets cherry 250g',
  'Tomàquets cherry frescos de temporada.',
  1.99,
  'Fruites i verdures',
  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
  true
),
(
  'merchant-super-0000-0000-000000000003',
  'Plàtans maduixots 1kg',
  'Plàtans de qualitat, punt de maduresa òptim.',
  1.59,
  'Fruites i verdures',
  'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400',
  true
),
(
  'merchant-super-0000-0000-000000000003',
  'Pasta espaguetis 500g',
  'Pasta de sèmola de blat dur. Qualitat premium.',
  1.20,
  'Pasta i arròs',
  'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400',
  true
),
(
  'merchant-super-0000-0000-000000000003',
  'Detergent roba 40 rentades',
  'Detergent líquid per a roba blanca i de color.',
  7.50,
  'Neteja',
  'https://images.unsplash.com/photo-1585687433141-8e3a0393e7f4?w=400',
  true
),
(
  'merchant-super-0000-0000-000000000003',
  'Aigua mineral 6x1.5L',
  'Pack de 6 ampolles d''1,5 litres d''aigua mineral natural.',
  3.20,
  'Begudes',
  'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400',
  true
);
