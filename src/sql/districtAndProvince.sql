

-- create TABLE districts (
-- id int not null,
-- name varchar(20),
-- province_id int
-- primary key (id)
-- )


INSERT INTO districts (id,name,province_id)
VALUES
    (1, 'Bhojpur', 1),
    (2 ,'Dhankuta', 1),
    (3, 'Ilam ', 1),
    (4, 'Jhapa ', 1),
    (5, 'Khotang ', 1),
    (6, 'Morang ', 1),
    (7, 'Okhaldhunga ', 1),
    (8, 'Panchthar ', 1),
    (9, 'Sankhuwasabha ', 1),
    (10, 'Solukhumbu ', 1),
    (11, 'Sunsari ', 1),
    (12, 'Taplejung ', 1),
    (13, 'Terhathum ', 1),
    (14, 'Udayapur', 1),
    (15, 'Bara', 2),
    (16, 'Dhanusha', 2),
    (17, 'Mahottari', 2),
    (18, 'Parsa', 2),
    (19, 'Rautahat', 2),
    (20, 'Saptari', 2),
    (21, 'Sarlahi', 2),
    (22, 'Siraha', 2),
    (23, 'Bhaktapur', 3),
    (24, 'Chitwan ', 3),
    (25, 'Dhading ', 3),
    (26, 'Dolakha ', 3),
    (27, 'Kathmandu ', 3),
    (28, 'Kavrepalanchok ', 3),
    (29, 'Lalitpur ', 3),
    (30, 'Makwanpur ', 3),
    (31, 'Nuwakot ', 3),
    (32, 'Ramechhap ', 3),
    (33, 'Rasuwa ', 3),
    (34, 'Sindhuli ', 3),
    (35, 'Sindhupalchok ', 3),
    (36, 'Baglung', 4),
    (37, 'Gorkha', 4),
    (38, 'Kaski', 4),
    (39, 'Lamjung', 4),
    (40, 'Manang', 4),
    (41, 'Mustang', 4),
    (42, 'Myagdi', 4),
    (43, 'Nawalpur', 4),
    (44, 'Parbat', 4),
    (45, 'Syangja', 4),
    (46, 'Tanahun', 4),
    (47, 'Arghakhanchi', 5),
    (48, 'Banke', 5),
    (49, 'Bardiya', 5),
    (50, 'Dang Deukhuri', 5),
    (51, 'Eastern Rukum', 5),
    (52, 'Gulmi', 5),
    (53, 'Kapilvastu', 5),
    (54, 'Parasi', 5),
    (55, 'Palpa', 5),
    (56, 'Pyuthan', 5),
    (57, 'Rolpa', 5),
    (58, 'Rupandehi', 5),
    (59, 'Dailekh', 6),
    (60, 'Dolpa', 6),
    (61, 'Humla', 6),
    (62, 'Jajarkot', 6),
    (63, 'Jumla', 6),
    (64, 'Kalikot', 6),
    (65, 'Mugu', 6),
    (66, 'Salyan', 6),
    (67, 'Surkhet', 6),
    (68, 'Western Rukum', 6),
    (69, 'Achham', 7),
    (70, 'Baitadi', 7),
    (71, 'Bajhang', 7),
    (72, 'Bajura', 7),
    (73, 'Dadeldhura', 7),
    (74, 'Darchula', 7),
    (75, 'Doti', 7),
    (76, 'Kailali', 7),
    (77, 'Kanchanpur', 7);

-- create TABLE province (
-- 	id int not null,
-- 	name varchar(20)
--     primary key (id)
-- )


INSERT INTO provinces (id,name)
VALUES
    (1, 'Province 1'),
    (2, 'Province 2'),
    (3, 'Bagmati'),
    (4, 'Gandaki'),
    (5, 'Lumbini'),
    (6, 'Karnali'),
    (7, 'Sudurpashchim');
