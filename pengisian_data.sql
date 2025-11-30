-- Active: 1758024615389@@127.0.0.1@5432@sistem_presensi@public
INSERT INTO "Guru" ("kode_guru", "nama_lengkap", "jenis_kelamin", "bidang_keahlian", "email", "password") VALUES
('G0001','Yoab Dike','pria','Bahasa Inggris', 'Yoab_Presensi@gmail.com', 'ADMING'),
('G0002','Rio Ginting','pria','Matematika', 'Rio_Presensi@gmail.com', 'ADMING'),
('G0003','Dase M.P Banundi','wanita','Fisika', 'Dase_Presensi@gmail.com', 'ADMING'),
('G0004','Jacobus Kreutha','pria','Kimia', 'Jacobus_Presensi@gmail.com', 'ADMING'),
('G0005','Joan Hillary Windewani','wanita','Biologi', 'Joan_Presensi@gmail.com', 'ADMING'),
('G0006','Janny Yohana R.R Mano','wanita','Sejarah', 'Janny_Presensi@gmail.com', 'ADMING'),
('G0007','Daniel Souhoka','pria','Geografi', 'Daniel_Presensi@gmail.com', 'ADMING'),
('G0008','Geofink Jacob','pria','Ekonomi', 'Geofink_Presensi@gmail.com', 'ADMING'),
('G0009','Yuliana Pulung Balik','wanita','Sosiologi', 'Yuliana_Presensi@gmail.com', 'ADMING'),
('G0010','Nospialin Elina Kadame','wanita','Bahasa Inggris', 'Nospialin_Presensi@gmail.com', 'ADMING'),
('G0011','Violina Gloria G.R Tamalea','wanita','Seni Budaya', 'Violina_Presensi@gmail.com', 'ADMING'),
('G0012','Herbelince Tenine','pria','Penjas', 'Herbelince_Presensi@gmail.com', 'ADMING'),
('G0013','Andrew David Pasulatan','pria','TIK', 'Andrew_Presensi@gmail.com', 'ADMING'),
('G0014','Arvy Olof R. Waramory','pria','PPKN', 'Arvy_Presensi@gmail.com', 'ADMING'),
('G0015','Siti Maria Tasik','wanita','Agama', 'Siti_Presensi@gmail.com', 'ADMING'),
('G0016','Oliver Ibo','pria','Matematika', 'Oliver_Presensi@gmail.com', 'ADMING');

INSERT INTO "Kelas" ("kode_kelas", "nama", "kode_wali_kelas") VALUES
('11_A', 'XI A', 'G0001'),
('11_B', 'XI B', 'G0002'),
('11_C', 'XI C', 'G0003'),
('11_D', 'XI D', 'G0004'),
('11_E_ipa', 'XI E ipa', 'G0005'),
('12_A', 'XII A', 'G0006'),
('12_B', 'XII B', 'G0007'),
('12_C', 'XII C', 'G0008'),
('12_D', 'XII D', 'G0009'),
('12_E', 'XII E', 'G0010');

--Membuat data siswa

-- Tidak ditemukan nomor_induk yang sama pada data siswa di bawah ini.
-- Semua nilai kunci (nomor_induk) sudah unik.

INSERT INTO "Siswa" ("nomor_induk", "nama_lengkap", "jenis_kelamin","kode_kelas_penempatan", "email", "password" ) VALUES
('0098618574', 'Albertho Katto', 'pria', '11_A', 'albertho_Presensi@gmail.com', 'SISWA'),
('0093195771', 'Alexandro Juan Fabiano Syaranamual', 'pria', '11_A', 'alexandro_Presensi@gmail.com', 'SISWA'),
('0093760051', 'Alfaro William Miller Ropu', 'pria', '11_A', 'alfaro_Presensi@gmail.com', 'SISWA'),
('0083535467', 'Anton Yansip', 'pria', '11_A', 'anton_Presensi@gmail.com', 'SISWA'),
('0089298173', 'Christine Solagratia Olua', 'wanita', '11_A', 'christine_Presensi@gmail.com', 'SISWA'),
('0083601202', 'Davinci Julio Okomanop', 'pria', '11_A', 'davinci_Presensi@gmail.com', 'SISWA'),
('0096685886', 'Fran Kwasuk Wesapla', 'pria', '11_A', 'fran_Presensi@gmail.com', 'SISWA'),
('0099633465', 'Gregorius P. Sopaheluwakan', 'pria', '11_A', 'gregorius_Presensi@gmail.com', 'SISWA'),
('3089639438', 'Hesron Abraham Dude', 'pria', '11_A', 'hesron_Presensi@gmail.com', 'SISWA'),
('0091646009', 'Jelove Q.R Karafir Renwarin', 'wanita', '11_A', 'jelove_Presensi@gmail.com', 'SISWA'),
('0099270210', 'Jesicca Welfina Rode Awes', 'wanita', '11_A', 'jesicca_Presensi@gmail.com', 'SISWA'),
('0103986170', 'Kingsley Abriel Mbatu', 'pria', '11_A', 'kingsley_Presensi@gmail.com', 'SISWA'),
('3072509064', 'Milison Wakur', 'pria', '11_A', 'milison_Presensi@gmail.com', 'SISWA'),
('0091344625', 'Minola Nistela Yewi', 'wanita', '11_A', 'minola_Presensi@gmail.com', 'SISWA'),
('3046297908', 'Mistail Tabuni', 'pria', '11_A', 'mistail_Presensi@gmail.com', 'SISWA'),
('0102057795', 'Natalia Pahabol', 'wanita', '11_A', 'natalia_Presensi@gmail.com', 'SISWA'),
('0085675221', 'Panat Alona Nirigi', 'wanita', '11_A', 'panat_Presensi@gmail.com', 'SISWA'),
('3066450751', 'Rohan G.G Pagawak', 'pria', '11_A', 'rohan_Presensi@gmail.com', 'SISWA'),
('0081029267', 'Rolince Koranue', 'wanita', '11_A', 'rolince_Presensi@gmail.com', 'SISWA'),
('0098381767', 'Sadrak Hopni Aliknoe', 'pria', '11_A', 'sadrak_Presensi@gmail.com', 'SISWA'),
('0081029284', 'Salomina T Sama', 'wanita', '11_A', 'salomina_Presensi@gmail.com', 'SISWA'),
('0084043502', 'Tenci Desti Daimoe', 'wanita', '11_A', 'tenci_Presensi@gmail.com', 'SISWA'),
('0092291332', 'Yespina Ivoni Lissa Wasahe', 'wanita', '11_A', 'yespina_Presensi@gmail.com', 'SISWA'),
('0099980165', 'Agnes Lorina Marchella Yonkoi Tungkoye', 'wanita', '11_B', 'agnes_Presensi@gmail.com', 'SISWA'),
('3072283985', 'Albertz Cartensliving Daimoi', 'pria', '11_B', 'albertz_Presensi@gmail.com', 'SISWA'),
('0085962247', 'Aldo Alfredo Duma Weya', 'pria', '11_B', 'aldo_Presensi@gmail.com', 'SISWA'),
('0092802610', 'Alfonsina Christalin Wally', 'wanita', '11_B', 'alfonsina_Presensi@gmail.com', 'SISWA'),
('3068503174', 'Andi Uopdana', 'pria', '11_B', 'andi_Presensi@gmail.com', 'SISWA'),
('0097438915', 'Charles Joni Pigai', 'pria', '11_B', 'charles_Presensi@gmail.com', 'SISWA'),
('3088503254', 'Debby Debora Mehue', 'wanita', '11_B', 'debby_Presensi@gmail.com', 'SISWA'),
('0073509285', 'Doki Uropmabin', 'pria', '11_B', 'doki_Presensi@gmail.com', 'SISWA'),
('0083878987', 'Eparans Yustus Awoitauw', 'pria', '11_B', 'eparans_Presensi@gmail.com', 'SISWA'),
('0099080609', 'Imanuel I.J Kambue', 'pria', '11_B', 'imanuel_Presensi@gmail.com', 'SISWA'),
('0077432181', 'Israel R.S Nukuboy', 'pria', '11_B', 'israel_Presensi@gmail.com', 'SISWA'),
('0094924109', 'Ivana Patra T. M. Sroyer', 'wanita', '11_B', 'ivana_Presensi@gmail.com', 'SISWA'),
('0081775433', 'Jaqualine Olga Novita Kofit', 'wanita', '11_B', 'jaqualine_Presensi@gmail.com', 'SISWA'),
('0099960441', 'Jisrael Lodewik Kogoya', 'pria', '11_B', 'jisrael_Presensi@gmail.com', 'SISWA'),
('0089300578', 'Kevin Barack Yamboisembut', 'pria', '11_B', 'kevin_Presensi@gmail.com', 'SISWA'),
('0103049881', 'Lady Lea Regina Yarona', 'wanita', '11_B', 'lady_Presensi@gmail.com', 'SISWA'),
('0081971422', 'Martina Kaway', 'wanita', '11_B', 'martina_Presensi@gmail.com', 'SISWA'),
('3101178217', 'Meilda Febriana Magai', 'wanita', '11_B', 'meilda_Presensi@gmail.com', 'SISWA'),
('0082436923', 'Melisa Telenggen', 'wanita', '11_B', 'melisa_Presensi@gmail.com', 'SISWA'),
('0092233281', 'Moris Cerullo Yarusabra', 'pria', '11_B', 'moris_Presensi@gmail.com', 'SISWA'),
('0099514856', 'Robinnho C.H Gundi Enembe', 'pria', '11_B', 'robinnho_Presensi@gmail.com', 'SISWA'),
('0097047650', 'Shanice Constance P.S Massie', 'wanita', '11_B', 'shanice_Presensi@gmail.com', 'SISWA'),
('0081448327', 'Sergio Elisama Aronggear', 'pria', '11_B', 'sergio_Presensi@gmail.com', 'SISWA'),
('0096200373', 'Vranklin Numberi', 'pria', '11_B', 'vranklin_Presensi@gmail.com', 'SISWA'),
('0095713964', 'Wisnu Nur Ajemi', 'pria', '11_B', 'wisnu_Presensi@gmail.com', 'SISWA'),
('0091229912', 'Yaap Paulus Papara', 'pria', '11_B', 'yaap_Presensi@gmail.com', 'SISWA'),
('0096848497', 'Yusuf Ronny Yaboisembut', 'pria', '11_B', 'yusuf_Presensi@gmail.com', 'SISWA'),
('0086974439', 'Agustian Imanuel Lokbere', 'pria', '11_C', 'agustian_Presensi@gmail.com', 'SISWA'),
('0097115314', 'Alberto Aldry Pongayow', 'pria', '11_C', 'alberto_Presensi@gmail.com', 'SISWA'),
('3104543944', 'Aldo Dewa Aster Krey', 'pria', '11_C', 'aldo_Presensi@gmail.com', 'SISWA'),
('0093269643', 'Alexandra Meyer Damoye', 'wanita', '11_C', 'alexandra_Presensi@gmail.com', 'SISWA'),
('0092179574', 'Blandina Teresia Pangkatana', 'wanita', '11_C', 'blandina_Presensi@gmail.com', 'SISWA'),
('3085268395', 'Butet Ocelin Malong', 'wanita', '11_C', 'butet_Presensi@gmail.com', 'SISWA'),
('0085041799', 'Christiani Manuela Payokwa', 'wanita', '11_C', 'christiani_Presensi@gmail.com', 'SISWA'),
('0082166597', 'Cornelis Septino Karma', 'pria', '11_C', 'cornelis_Presensi@gmail.com', 'SISWA'),
('0092021947', 'Debora Grace Adelia Demetouw', 'wanita', '11_C', 'debora_Presensi@gmail.com', 'SISWA'),
('0106424175', 'David Wilson Y. Dike', 'pria', '11_C', 'david_Presensi@gmail.com', 'SISWA'),
('0081367419', 'Eliezer Darongke Tumuatja', 'pria', '11_C', 'eliezer_Presensi@gmail.com', 'SISWA'),
('0091174638', 'Feyzan Rodry Was', 'pria', '11_C', 'feyzan_Presensi@gmail.com', 'SISWA'),
('0092196617', 'Izaskar Yosef Hokoyoku', 'pria', '11_C', 'izaskar_Presensi@gmail.com', 'SISWA'),
('3099163799', 'Jesen Narzul Yustus Sembai', 'pria', '11_C', 'jesen_Presensi@gmail.com', 'SISWA'),
('0095198495', 'Jhosua Boaz Daniel Sesa', 'pria', '11_C', 'jhosua_Presensi@gmail.com', 'SISWA'),
('0078207422', 'Katrin Anjelika Mansawan', 'wanita', '11_C', 'katrin_Presensi@gmail.com', 'SISWA'),
('3082599989', 'Lukas Robert Pangkatana', 'pria', '11_C', 'lukas_Presensi@gmail.com', 'SISWA'),
('0096965461', 'Nelcy Nety Kromsian', 'wanita', '11_C', 'nelcy_Presensi@gmail.com', 'SISWA'),
('0097979076', 'Philip John Marvic Ohee', 'pria', '11_C', 'philip_Presensi@gmail.com', 'SISWA'),
('0091103685', 'Reza Petur Erwin Tokoro', 'pria', '11_C', 'reza_Presensi@gmail.com', 'SISWA'),
('0077147394', 'Sergio Sem', 'pria', '11_C', 'sergio_Presensi@gmail.com', 'SISWA'),
('0083685472', 'Steven Wahyu Taime', 'pria', '11_C', 'steven_Presensi@gmail.com', 'SISWA'),
('3084763997', 'Syallom Marsela Yepasedanya', 'wanita', '11_C', 'syallom_Presensi@gmail.com', 'SISWA'),
('3097106599', 'Agnesia Bristneva Natalia Yikwa', 'wanita', '11_D', 'agnesia_Presensi@gmail.com', 'SISWA'),
('0091111913', 'Absalom Matheis Buce Bathkorumbawa', 'pria', '11_D', 'absalom_Presensi@gmail.com', 'SISWA'),
('0099131618', 'Albertho K. Ramandei', 'pria', '11_D', 'albertho_Presensi@gmail.com', 'SISWA'),
('0085560221', 'Alfason Heipon', 'pria', '11_D', 'alfason_Presensi@gmail.com', 'SISWA'),
('0086008629', 'Aryan Melky Stenly Ujabi', 'pria', '11_D', 'aryan_Presensi@gmail.com', 'SISWA'),
('3080694461', 'Bob Robert Tasti', 'pria', '11_D', 'bob_Presensi@gmail.com', 'SISWA'),
('0086380232', 'Christiano Abraham Kreutha', 'pria', '11_D', 'christiano_Presensi@gmail.com', 'SISWA'),
('0085158462', 'Dianifa Sesewano', 'wanita', '11_D', 'dianifa_Presensi@gmail.com', 'SISWA'),
('0098888279', 'Erfiana Halitopo', 'wanita', '11_D', 'erfiana_Presensi@gmail.com', 'SISWA'),
('0082027449', 'Ester Dike', 'wanita', '11_D', 'ester_Presensi@gmail.com', 'SISWA'),
('0076850207', 'Firman Kogoya', 'pria', '11_D', 'firman_Presensi@gmail.com', 'SISWA'),
('0098352549', 'Granier Juan Roberth Suebu', 'pria', '11_D', 'granier_Presensi@gmail.com', 'SISWA'),
('0104983239', 'Grassela Victorya Ayu Kamsy', 'wanita', '11_D', 'grassela_Presensi@gmail.com', 'SISWA'),
('0084150777', 'M. Albadiu Ramadan', 'pria', '11_D', 'albadiu_Presensi@gmail.com', 'SISWA'),
('0087340717', 'Marlina Suebu', 'wanita', '11_D', 'marlina_Presensi@gmail.com', 'SISWA'),
('0087531078', 'Novalia Samonsabra', 'wanita', '11_D', 'novalia_Presensi@gmail.com', 'SISWA'),
('0085096315', 'Tiery Henry V. Warinusi', 'pria', '11_D', 'tiery_Presensi@gmail.com', 'SISWA'),
('0099622063', 'Wafuway Sem Seseray', 'pria', '11_D', 'wafuway_Presensi@gmail.com', 'SISWA'),
('0092922277', 'Yeni Kristin Yarisetouw', 'wanita', '11_D', 'yeni_Presensi@gmail.com', 'SISWA'),
('0091677166', 'Yuliance Oiwari', 'wanita', '11_D', 'yuliance_Presensi@gmail.com', 'SISWA'),
('0104063472', 'Alfian Magnus Simbiak', 'pria', '11_E_ipa', 'alfian_Presensi@gmail.com', 'SISWA'),
('3109905681', 'Anna Margaretha Farwas', 'wanita', '11_E_ipa', 'anna_Presensi@gmail.com', 'SISWA'),
('0086644173', 'Belessing Elisabeth J.N.J Sasarari', 'wanita', '11_E_ipa', 'belessing_Presensi@gmail.com', 'SISWA'),
('0083529191', 'Chevin Afasedanya', 'pria', '11_E_ipa', 'chevin_Presensi@gmail.com', 'SISWA'),
('0108214276', 'Claudya Lidya G. Koroba', 'wanita', '11_E_ipa', 'claudya_Presensi@gmail.com', 'SISWA'),
('0092544952', 'CLay H.F. Tembesing', 'pria', '11_E_ipa', 'clay_Presensi@gmail.com', 'SISWA'),
('0109331811', 'Febrian Edison Done', 'pria', '11_E_ipa', 'febrian_Presensi@gmail.com', 'SISWA'),
('0104207166', 'Feronika Papuana Eklesia Ela Kambu', 'wanita', '11_E_ipa', 'feronika_Presensi@gmail.com', 'SISWA'),
('0092695326', 'Gabriel Awipapa Gaipo Edowai', 'pria', '11_E_ipa', 'gabriel_Presensi@gmail.com', 'SISWA'),
('3091100873', 'Gracia Kambuaya', 'wanita', '11_E_ipa', 'gracia_Presensi@gmail.com', 'SISWA'),
('0109947146', 'Harthatia Yikwa', 'wanita', '11_E_ipa', 'harthatia_Presensi@gmail.com', 'SISWA'),
('0097381330', 'Jacky Raman Kagaikebo Edowai', 'pria', '11_E_ipa', 'jacky_Presensi@gmail.com', 'SISWA'),
('3104826320', 'Jesaya Putra Pamando Weya', 'pria', '11_E_ipa', 'jesaya_Presensi@gmail.com', 'SISWA'),
('0098591024', 'Johan Wihell Mambraku', 'pria', '11_E_ipa', 'johan_Presensi@gmail.com', 'SISWA'),
('0107240383', 'John Piter Pangkatana', 'pria', '11_E_ipa', 'john_Presensi@gmail.com', 'SISWA'),
('0094457389', 'Jufred Olmerd Sinery', 'pria', '11_E_ipa', 'jufred_Presensi@gmail.com', 'SISWA'),
('0095154329', 'Juninho Sampary Mambrasar', 'pria', '11_E_ipa', 'juninho_Presensi@gmail.com', 'SISWA'),
('0095147370', 'Lynette Tiffanie Vanessa Kafiar', 'wanita', '11_E_ipa', 'lynette_Presensi@gmail.com', 'SISWA'),
('0093847420', 'Marthina Melanovich Yekusamon', 'wanita', '11_E_ipa', 'Marthina_Presensi@gmail.com', 'SISWA'),
('0104307137', 'Mia Maria Betelop Saikembet', 'wanita', '11_E_ipa', 'Mia_Presensi@gmail.com', 'SISWA'),
('3101060288', 'Olivia Mahrid Entong', 'wanita', '11_E_ipa', 'Olivia_Mahrid_Presensi@gmail.com', 'SISWA'),
('0097005596', 'Pearly Gwenlee Watory', 'wanita', '11_E_ipa', 'Pearly_Gwenlee_Presensi@gmail.com', 'SISWA'),
('0104703659', 'Perigrinus Petrado Ogi Charles', 'pria', '11_E_ipa', 'Perigrinus_Petrado_Presensi@gmail.com', 'SISWA'),
('0118392568', 'Rehuela Zahra Golda Meyer Karubaba', 'wanita', '11_E_ipa', 'Rehuela_Zahra_Presensi@gmail.com', 'SISWA'),
('0092535734', 'Scholastika Olin Aprilia Kanath', 'wanita', '11_E_ipa', 'Scholastika_Olin_Presensi@gmail.com', 'SISWA'),
('0098651369', 'Selpiana Daimoe', 'wanita', '11_E_ipa', 'Selpiana_Daimoe_Presensi@gmail.com', 'SISWA'),
('0093061686', 'Tifany Aurelya Mambu', 'pria', '11_E_ipa', 'Tifany_Aurelya_Presensi@gmail.com', 'SISWA'),
('0101660372', 'Timothy Carlos Runtuwene', 'pria', '11_E_ipa', 'Timothy_Carlos_Presensi@gmail.com', 'SISWA'),
('0096830872', 'Vanessa Sisilia Kaway', 'wanita', '11_E_ipa', 'Vanessa_Sisilia_Presensi@gmail.com', 'SISWA'),
('0097296168', 'Villia Michelle Maay', 'wanita', '11_E_ipa', 'Villia_Michelle_Presensi@gmail.com', 'SISWA'),
('3084975464', 'Welsa Asria Rogi', 'wanita', '11_E_ipa', 'Welsa_Asria_Presensi@gmail.com', 'SISWA'),
('0073498380', 'Adriel Marcus', 'pria', '12_A', 'Adriel_Presensi@gmail.com', 'SISWA'),
('0082140232', 'Apriano Adriyansyah Manansang', 'pria', '12_A', 'Apriano_Presensi@gmail.com', 'SISWA'),
('3090437027', 'Batseba Kaway', 'wanita', '12_A', 'Batseba_Presensi@gmail.com', 'SISWA'),
('0071360017', 'Clara Elisabeth Deda', 'wanita', '12_A', 'Clara_Presensi@gmail.com', 'SISWA'),
('0071008010', 'Erick Zonggonau', 'pria', '12_A', 'Erick_Presensi@gmail.com', 'SISWA'),
('3074704305', 'Ester Rosalina Wandik', 'wanita', '12_A', 'Ester_Presensi@gmail.com', 'SISWA'),
('0089870212', 'Eunice Aveska Massie', 'wanita', '12_A', 'Eunice_Presensi@gmail.com', 'SISWA'),
('0081983342', 'Febriana Silviana Ayakeding', 'wanita', '12_A', 'Febriana_Presensi@gmail.com', 'SISWA'),
('3082987097', 'Gloria Cindy Kalasina Marani', 'wanita', '12_A', 'Gloria_Presensi@gmail.com', 'SISWA'),
('0061772631', 'Herlina Belandina Kaway', 'wanita', '12_A', 'Herlina_Presensi@gmail.com', 'SISWA'),
('0071171615', 'Herlince Beanal', 'wanita', '12_A', 'Herlince_Presensi@gmail.com', 'SISWA'),
('0088495953', 'Juan Richard Monim', 'pria', '12_A', 'Juan_Presensi@gmail.com', 'SISWA'),
('3062573461', 'Kristi Yunita Kum', 'wanita', '12_A', 'Kristi_Presensi@gmail.com', 'SISWA'),
('0074462042', 'Matius Yulius Kemusabra', 'pria', '12_A', 'Matius_Presensi@gmail.com', 'SISWA'),
('0081932877', 'Mc. Casey Jonathan Semet', 'pria', '12_A', 'Mc.Casey_Presensi@gmail.com', 'SISWA'),
('0062452884', 'Melky Stenly Niwilingame', 'pria', '12_A', 'Melky_Presensi@gmail.com', 'SISWA'),
('0077796595', 'Rio Mina Koranue', 'pria', '12_A', 'Rio_Mina_Presensi@gmail.com', 'SISWA'),
('3086113333', 'Rully Spanya Taime', 'pria', '12_A', 'Rully_Spanya_Presensi@gmail.com', 'SISWA'),
('0074800621', 'Sabrina Rosyendi Krey', 'wanita', '12_A', 'Sabrina_Rosyendi_Presensi@gmail.com', 'SISWA'),
('3061451714', 'Samuel Eto Kogoya', 'pria', '12_A', 'Samuel_Eto_Presensi@gmail.com', 'SISWA'),
('0067680480', 'Sila Ware', 'wanita', '12_A', 'Sila_Ware_Presensi@gmail.com', 'SISWA'),
('3094830928', 'Amanda Waker', 'wanita', '12_B', 'Amanda_Presensi@gmail.com', 'SISWA'),
('0083880202', 'Emanuel Oromji', 'pria', '12_B', 'Emanuel_Presensi@gmail.com', 'SISWA'),
('0088135704', 'Febrio Kafiar', 'pria', '12_B', 'Febrio_Presensi@gmail.com', 'SISWA'),
('0087232572', 'Gabriel Made Faidiban', 'pria', '12_B', 'Gabriel_Presensi@gmail.com', 'SISWA'),
('0086784562', 'Gabriela Janampa', 'wanita', '12_B', 'Gabriela_Presensi@gmail.com', 'SISWA'),
('3088959346', 'Gersom Wenda', 'pria', '12_B', 'Gersom_Presensi@gmail.com', 'SISWA'),
('0084016967', 'Grace Mulait', 'wanita', '12_B', 'Grace_Presensi@gmail.com', 'SISWA'),
('0085511247', 'Kaleb Gasper Daimoye', 'pria', '12_B', 'Kaleb_Presensi@gmail.com', 'SISWA'),
('3083971237', 'Malin Beanal', 'wanita', '12_B', 'Malin_Presensi@gmail.com', 'SISWA'),
('0094572325', 'Marget Elis Samonsabra', 'wanita', '12_B', 'Marget_Presensi@gmail.com', 'SISWA'),
('0052654820', 'Oktovina Ware', 'wanita', '12_B', 'Oktovina_Presensi@gmail.com', 'SISWA'),
('0078084151', 'Otalina Epety', 'wanita', '12_B', 'Otalina_Epety_Presensi@gmail.com', 'SISWA'),
('0099898294', 'Palda Yenny Kogoya', 'wanita', '12_B', 'Palda_Yenny_Presensi@gmail.com', 'SISWA'),
('3081583118', 'Rahamzes Wandikbo', 'pria', '12_B', 'Rahamzes_Presensi@gmail.com', 'SISWA'),
('0079067926', 'Selviana Nerokepouw', 'wanita', '12_B', 'Selviana_Nerokepouw_Presensi@gmail.com', 'SISWA'),
('0054419355', 'Tibor Donatus Kutapo', 'pria', '12_B', 'Tibor_Donatus_Presensi@gmail.com', 'SISWA'),
('0068254249', 'Tina Elopere', 'wanita', '12_B', 'Tina_Elopere_Presensi@gmail.com', 'SISWA'),
('0088424171', 'Antonio Fernando Tungkoye', 'pria', '12_C', 'Antonio_Presensi@gmail.com', 'SISWA'),
('0900000010', 'Beby Uamang', 'pria', '12_C', 'Beby_Presensi@gmail.com', 'SISWA'),
('0075996570', 'Bonifacius Timang', 'pria', '12_C', 'Bonifacius_Presensi@gmail.com', 'SISWA'),
('0065202414', 'Boper Wandikbo', 'pria', '12_C', 'Boper_Presensi@gmail.com', 'SISWA'),
('0074241068', 'Dancelina W. Tauruy', 'wanita', '12_C', 'Dancelina_Presensi@gmail.com', 'SISWA'),
('0089354744', 'Devit Isak Pakage', 'pria', '12_C', 'Devit_Presensi@gmail.com', 'SISWA'),
('0072032727', 'Heberth Suebu', 'pria', '12_C', 'Heberth_Presensi@gmail.com', 'SISWA'),
('0082265872', 'Julio Dedek Cahyo Gunawan', 'pria', '12_C', 'Julio_Presensi@gmail.com', 'SISWA'),
('0060118207', 'Karel Kamani', 'pria', '12_C', 'Karel_Presensi@gmail.com', 'SISWA'),
('0082690268', 'Konda Daverson Yikwa', 'pria', '12_C', 'Konda_Presensi@gmail.com', 'SISWA'),
('0085948889', 'Lionel Mc. Farlan Wonua', 'pria', '12_C', 'Lionel_Presensi@gmail.com', 'SISWA'),
('3069710479', 'Moricus Biporo', 'pria', '12_C', 'Moricus_Presensi@gmail.com', 'SISWA'),
('0072870397', 'Natalis Epere', 'pria', '12_C', 'Natalis_Presensi@gmail.com', 'SISWA'),
('0086816842', 'Nikson Mario Pangkatana', 'pria', '12_C', 'Nikson_Presensi@gmail.com', 'SISWA'),
('0083538462', 'Nintius Bugiangge', 'pria', '12_C', 'Nintius_Presensi@gmail.com', 'SISWA'),
('0044459196', 'Ones Tusep', 'pria', '12_C', 'Ones_Tusep_Presensi@gmail.com', 'SISWA'),
('0064040915', 'Peniau Uamang', 'pria', '12_C', 'Peniau_Uamang_Presensi@gmail.com', 'SISWA'),
('0085211261', 'Priscilia Titi Awoitauw', 'wanita', '12_C', 'Pricilia_Presensi@gmail.com', 'SISWA'),
('3073307191', 'Rafenelli R. Suebu', 'pria', '12_C', 'Rafenelli_Presensi@gmail.com', 'SISWA'),
('0084640307', 'Rudi Ciae', 'pria', '12_C', 'Rudi_Ciae_Presensi@gmail.com', 'SISWA'),
('0083069288', 'Samuel Yakobus Dimor', 'pria', '12_C', 'Samuel_Yakobus_Presensi@gmail.com', 'SISWA'),
('0089009008', 'Siane Nukuboy', 'wanita', '12_C', 'Siane_Nukuboy_Presensi@gmail.com', 'SISWA'),
('0062077650', 'Soleman Gidion Philipus Mayai', 'pria', '12_C', 'Soleman_Gidion_Presensi@gmail.com', 'SISWA'),
('3052423537', 'Solminus Deikme', 'pria', '12_C', 'Solminus_Deikme_Presensi@gmail.com', 'SISWA'),
('0086157243', 'Susan Alfonsina G. Agaki', 'wanita', '12_C', 'Susan_Alfonsina_Presensi@gmail.com', 'SISWA'),
('0082439929', 'Yakob Jeck Bonsapia', 'pria', '12_C', 'Yakob_Jeck_Presensi@gmail.com', 'SISWA'),
('0087958741', 'Yomahe Haren Ruth Murib', 'wanita', '12_C', 'Yomahe_Haren_Presensi@gmail.com', 'SISWA'),
('0098228323', 'Albert Frits Armand Wayoi', 'pria', '12_D', 'Albert_Presensi@gmail.com', 'SISWA'),
('0028846671', 'Agustinus Bukaleng', 'pria', '12_D', 'Agustinus_Presensi@gmail.com', 'SISWA'),
('0087846332', 'Aldo Stenly Baransay', 'pria', '12_D', 'Aldo_Presensi@gmail.com', 'SISWA'),
('0064696864', 'Alex Beanal', 'pria', '12_D', 'Alex_Presensi@gmail.com', 'SISWA'),
('0059322562', 'Alex Kelabetme', 'pria', '12_D', 'Alex_Kelabetme_Presensi@gmail.com', 'SISWA'),
('0087497638', 'Alfrida Ruth Telenggen', 'wanita', '12_D', 'Alfrida_Ruth_Presensi@gmail.com', 'SISWA'),
('0053817232', 'Andri Natkime', 'pria', '12_D', 'Andri_Presensi@gmail.com', 'SISWA'),
('0088974207', 'Apetinus Magal', 'pria', '12_D', 'Apetinus_Presensi@gmail.com', 'SISWA'),
('0087997389', 'Daud M. Nabyal', 'pria', '12_D', 'Daud_Presensi@gmail.com', 'SISWA'),
('0061510081', 'Demison Enembe', 'pria', '12_D', 'Demison_Presensi@gmail.com', 'SISWA'),
('0088148779', 'Dion Firgi Nukubol', 'pria', '12_D', 'Dion_Presensi@gmail.com', 'SISWA'),
('0054078855', 'Edison Kelabetme', 'pria', '12_D', 'Edison_Presensi@gmail.com', 'SISWA'),
('0076235525', 'Ferdi Sani', 'pria', '12_D', 'Ferdi_Presensi@gmail.com', 'SISWA'),
('0073272096', 'Gracella Novita Baab', 'wanita', '12_D', 'Gracella_Presensi@gmail.com', 'SISWA'),
('0076337933', 'Heni Meriesca Tokoro', 'wanita', '12_D', 'Heni_Presensi@gmail.com', 'SISWA'),
('0050000001', 'Hilarius Kaimop', 'pria', '12_D', 'Hilarius_Presensi@gmail.com', 'SISWA'),
('0074101778', 'Lenora Melangsena', 'wanita', '12_D', 'Lenora_Presensi@gmail.com', 'SISWA'),
('3072951366', 'Lewi Uropmabin', 'pria', '12_D', 'Lewi_Presensi@gmail.com', 'SISWA'),
('3055007890', 'Mince Yuliana Gwenjau', 'wanita', '12_D', 'Mince_Presensi@gmail.com', 'SISWA'),
('0081057930', 'Novi Kum', 'wanita', '12_D', 'Novi_Presensi@gmail.com', 'SISWA'),
('0063381953', 'Oktovianus Kreutha', 'pria', '12_D', 'Oktovianus_Presensi@gmail.com', 'SISWA'),
('0088147134', 'Olivia Fradela Ericha Wally', 'wanita', '12_D', 'Olivia_Presensi@gmail.com', 'SISWA'),
('0033003446', 'Onivrina Nosolanemeng Kibak Magal', 'pria', '12_D', 'Onivrina_Nosolanemeng_Presensi@gmail.com', 'SISWA'),
('3109794979', 'Perinus Beanal', 'pria', '12_D', 'Perinus_Beanal_Presensi@gmail.com', 'SISWA'),
('0700000002', 'Serinus Dimpau', 'pria', '12_D', 'Serinus_Dimpau_Presensi@gmail.com', 'SISWA'),
('3055208966', 'Talciau Uamang', 'pria', '12_D', 'Talciau_Uamang_Presensi@gmail.com', 'SISWA'),
('3079789256', 'Tatimaida Jikwa', 'wanita', '12_D', 'Tatimaida_Presensi@gmail.com', 'SISWA'),
('0048921163', 'Terpianus Janampa', 'pria', '12_D', 'Terpianus_Janampa_Presensi@gmail.com', 'SISWA'),
('3062426887', 'Yohanes Gwenjau', 'pria', '12_D', 'Yohanes_Gwenjau_Presensi@gmail.com', 'SISWA'),
('0057247917', 'Agus Indri', 'pria', '12_E', 'Agus_Presensi@gmail.com', 'SISWA'),
('0075374112', 'Alvin Asso', 'pria', '12_E', 'Alvin_Presensi@gmail.com', 'SISWA'),
('0077550009', 'Antonius Timang', 'pria', '12_E', 'Antonius_Presensi@gmail.com', 'SISWA'),
('0083129655', 'Anjas Fernando Marweri', 'pria', '12_E', 'Anjas_Presensi@gmail.com', 'SISWA'),
('0071987936', 'Atael Wandagau', 'pria', '12_E', 'Atael_Presensi@gmail.com', 'SISWA'),
('3040341417', 'Eminus Ogolmagay', 'pria', '12_E', 'Eminus_Presensi@gmail.com', 'SISWA'),
('3077922855', 'Eranus Kogoya', 'pria', '12_E', 'Eranus_Presensi@gmail.com', 'SISWA'),
('0077787130', 'Jerry Jacob Yom', 'pria', '12_E', 'Jerry_Presensi@gmail.com', 'SISWA'),
('0081206127', 'Johanes Faidiban', 'pria', '12_E', 'Johanes_Presensi@gmail.com', 'SISWA'),
('0048875440', 'Jorinus Deikme', 'pria', '12_E', 'Jorinus_Presensi@gmail.com', 'SISWA'),
('0083815549', 'Julio Samuel Rumbairusi', 'pria', '12_E', 'Julio_Presensi@gmail.com', 'SISWA'),
('0088714058', 'Junelda Trapen', 'wanita', '12_E', 'Junelda_Presensi@gmail.com', 'SISWA'),
('0087444931', 'Kristian Bonsapia', 'pria', '12_E', 'Kristian_Presensi@gmail.com', 'SISWA'),
('0087123010', 'Mario Geits Nataniel Yappo', 'pria', '12_E', 'Mario_Presensi@gmail.com', 'SISWA'),
('2067641192', 'Matius Yunus Uamang', 'pria', '12_E', 'Matius_Presensi@gmail.com', 'SISWA'),
('0085167438', 'Natalia Jelika Yom', 'wanita', '12_E', 'Natalia_Presensi@gmail.com', 'SISWA'),
('3057349810', 'Pontus Uamang', 'pria', '12_E', 'Pontus_Presensi@gmail.com', 'SISWA'),
('0079462486', 'Rahel I. Nukuboy', 'wanita', '12_E', 'Rahel_Presensi@gmail.com', 'SISWA'),
('0063472109', 'Rani Uamang', 'wanita', '12_E', 'Rani_Presensi@gmail.com', 'SISWA'),
('3061407312', 'Rickardo Deisaple', 'pria', '12_E', 'Rickardo_Presensi@gmail.com', 'SISWA'),
('0083339252', 'Rosalinda Eca Sokoy', 'wanita', '12_E', 'Rosalinda_Eca_Presensi@gmail.com', 'SISWA'),
('0083605421', 'Rumulus Timang', 'pria', '12_E', 'Rumulus_Timang_Presensi@gmail.com', 'SISWA'),
('0079829842', 'Silas J. Pangkatana', 'pria', '12_E', 'Silas_Pangkatana_Presensi@gmail.com', 'SISWA'),
('0063326063', 'Silas Edwin Wikari', 'pria', '12_E', 'Silas_Edwin_Presensi@gmail.com', 'SISWA'),
('0092582898', 'Yafet Kreutha', 'pria', '12_E', 'Yafet_Kreutha_Presensi@gmail.com', 'SISWA'),
('0074841650', 'Yakobus Wally', 'pria', '12_E', 'Yakobus_Wally_Presensi@gmail.com', 'SISWA'),
('0075716777', 'Yusmin Peyon', 'pria', '12_E', 'Yusmin_Peyon_Presensi@gmail.com', 'SISWA');

SELECT * FROM "Guru";
SELECT * FROM "Kelas";

--KEHADIRAN
SELECT * FROM "Kehadiran";


INSERT INTO "Kehadiran" ("tanggal","kode_kelas","kode_wali_kelas","tahun_ajaran")
SELECT 
    "tanggal":: DATE, '11_A', 'G0001','2025/2026'
FROM 
    generate_series('2025-10-01':: DATE, '2025-10-31' :: DATE, interval '1 day') AS "tanggal"
WHERE 
    EXTRACT (DOW FROM "tanggal") NOT IN (0,6);


--ISI SISWA
SELECT * FROM "Siswa" LIMIT 250;
SELECT * FROM "SiswaKehadiran" ORDER BY "sesi_id";



INSERT INTO "SiswaKehadiran" ("kehadiran_id",
"nomor_induk_siswa","hadir","alasan_tidak_hadir")
SELECT
"K"."kehadiran_id",
"S"."nomor_induk"
TRUE,
NULL,
NULL
FROM "Kehadiran" AS "K"
    CROSS JOIN "Siswa" AS "S"
WHERE 
    "K"."kode_kelas" = '11_A'
    AND "S"."kode_kelas_penempatan" = '11_A';



--ubaah beberapa siswa yang tidak hadir karena sakit,izin,alpa
UPDATE "SiswaKehadiran"
SET
    "hadir" = FALSE,
    "alasan_tidak_hadir" = 'sakit'
WHERE 
    "kehadiran_id" IN (11,12)
    AND "nomor_induk_siswa" IN ('0098618574','0098618574');

--Rekapitulasi kehadiran siswa
SELECT * 
FROM "SiswaKehadiran" 
WHERE "hadir" = FALSE
ORDER BY "sesi_id";

--Banyak sakit,izin,alpa
SELECT "SK"."alasan_tidak_hadir", COUNT(*) 
FROM "SiswaKehadiran" AS "SK"
    JOIN "Kehadiran" AS "K" ON "SK"."kehadiran_id" = "K"."kehadiran_id"
WHERE "SK"."hadir" = FALSE
    AND "K"."kode_kelas" = '11_A'
    AND "K"."tanggal" BETWEEN '2025-10-01' AND '2025-10-31'
    GROUP BY "SK"."alasan_tidak_hadir";

--BERDASARKAN SISWA
SELECT * 
FROM "SiswaKehadiran" 
WHERE "hadir" = FALSE
ORDER BY "sesi_id";
SELECT "S"."nama_lengkap", "SK"."alasan_tidak_hadir", COUNT(*) AS "jumlah_tidak_hadir"
FROM "SiswaKehadiran" AS "SK"
     JOIN "Siswa" AS "S" ON "SK"."nomor_induk_siswa" = "S"."nomor_induk"
     JOIN "Kehadiran" AS "K" ON "SK"."kehadiran_id" = "K"."kehadiran_id"
    JOIN "Kelas" AS "KLS" ON "S"."kode_kelas_penempatan" = "KLS"."kode_kelas"
WHERE "SK"."hadir" = FALSE
    AND "K"."tanggal" BETWEEN '2025-10-01' AND '2025-10-31'
    AND "K"."kode_kelas" = "KLS"."kode_kelas"
GROUP BY "S"."nama_lengkap", "SK"."alasan_tidak_hadir", "KLS"."nama"
ORDER BY "jumlah_tidak_hadir" DESC, "S"."nama_lengkap";