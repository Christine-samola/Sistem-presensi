"""
Django management command untuk seed fresh data berdasarkan pengisian_data.sql
Usage: python manage.py seed_fresh_data
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.users.models import User
from apps.classes.models import Kelas, MataPelajaran, SiswaKelas


class Command(BaseCommand):
    help = 'Seed fresh data (Guru, Siswa, Kelas, Mata Pelajaran)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            SiswaKelas.objects.all().delete()
            Kelas.objects.all().delete()
            MataPelajaran.objects.all().delete()
            User.objects.filter(role__in=[User.Role.GURU, User.Role.SISWA]).delete()
            self.stdout.write(self.style.SUCCESS('✓ Data cleared'))

        with transaction.atomic():
            # Step 1: Create Mata Pelajaran
            self.stdout.write('Creating Mata Pelajaran...')
            mata_pelajaran_dict = self.create_mata_pelajaran()
            self.stdout.write(self.style.SUCCESS(f'✓ Created {len(mata_pelajaran_dict)} Mata Pelajaran'))

            # Step 2: Create Guru
            self.stdout.write('Creating Guru...')
            guru_dict = self.create_guru(mata_pelajaran_dict)
            self.stdout.write(self.style.SUCCESS(f'✓ Created {len(guru_dict)} Guru'))

            # Step 3: Create Kelas
            self.stdout.write('Creating Kelas...')
            kelas_dict = self.create_kelas(guru_dict)
            self.stdout.write(self.style.SUCCESS(f'✓ Created {len(kelas_dict)} Kelas'))

            # Step 4: Create Siswa
            self.stdout.write('Creating Siswa...')
            total_siswa = self.create_siswa(kelas_dict)
            self.stdout.write(self.style.SUCCESS(f'✓ Created {total_siswa} Siswa'))

        self.stdout.write(self.style.SUCCESS('\n🎉 Fresh data seeding completed successfully!'))
        self.stdout.write(self.style.SUCCESS('\nDefault Password:'))
        self.stdout.write('  - Admin: password123')
        self.stdout.write('  - Guru: ADMING')
        self.stdout.write('  - Siswa: SISWA')

    def create_mata_pelajaran(self):
        """Create Mata Pelajaran based on bidang_keahlian"""
        mata_pelajaran_data = [
            {'kode': 'BING', 'nama': 'Bahasa Inggris'},
            {'kode': 'MAT', 'nama': 'Matematika'},
            {'kode': 'FIS', 'nama': 'Fisika'},
            {'kode': 'KIM', 'nama': 'Kimia'},
            {'kode': 'BIO', 'nama': 'Biologi'},
            {'kode': 'SEJ', 'nama': 'Sejarah'},
            {'kode': 'GEO', 'nama': 'Geografi'},
            {'kode': 'EKO', 'nama': 'Ekonomi'},
            {'kode': 'SOS', 'nama': 'Sosiologi'},
            {'kode': 'SBD', 'nama': 'Seni Budaya'},
            {'kode': 'PJK', 'nama': 'Penjas'},
            {'kode': 'TIK', 'nama': 'TIK'},
            {'kode': 'PKN', 'nama': 'PPKN'},
            {'kode': 'AGM', 'nama': 'Agama'},
        ]

        mata_pelajaran_dict = {}
        for data in mata_pelajaran_data:
            mapel, created = MataPelajaran.objects.get_or_create(
                kode=data['kode'],
                defaults={
                    'nama': data['nama'],
                    'deskripsi': f'Mata pelajaran {data["nama"]}',
                    'is_active': True
                }
            )
            mata_pelajaran_dict[data['nama']] = mapel

        return mata_pelajaran_dict

    def create_guru(self, mata_pelajaran_dict):
        """Create Guru dari data SQL"""
        guru_data = [
            ('G0001', 'Yoab Dike', 'pria', 'Bahasa Inggris', 'Yoab_Presensi@gmail.com'),
            ('G0002', 'Rio Ginting', 'pria', 'Matematika', 'Rio_Presensi@gmail.com'),
            ('G0003', 'Dase M.P Banundi', 'wanita', 'Fisika', 'Dase_Presensi@gmail.com'),
            ('G0004', 'Jacobus Kreutha', 'pria', 'Kimia', 'Jacobus_Presensi@gmail.com'),
            ('G0005', 'Joan Hillary Windewani', 'wanita', 'Biologi', 'Joan_Presensi@gmail.com'),
            ('G0006', 'Janny Yohana R.R Mano', 'wanita', 'Sejarah', 'Janny_Presensi@gmail.com'),
            ('G0007', 'Daniel Souhoka', 'pria', 'Geografi', 'Daniel_Presensi@gmail.com'),
            ('G0008', 'Geofink Jacob', 'pria', 'Ekonomi', 'Geofink_Presensi@gmail.com'),
            ('G0009', 'Yuliana Pulung Balik', 'wanita', 'Sosiologi', 'Yuliana_Presensi@gmail.com'),
            ('G0010', 'Nospialin Elina Kadame', 'wanita', 'Bahasa Inggris', 'Nospialin_Presensi@gmail.com'),
            ('G0011', 'Violina Gloria G.R Tamalea', 'wanita', 'Seni Budaya', 'Violina_Presensi@gmail.com'),
            ('G0012', 'Herbelince Tenine', 'pria', 'Penjas', 'Herbelince_Presensi@gmail.com'),
            ('G0013', 'Andrew David Pasulatan', 'pria', 'TIK', 'Andrew_Presensi@gmail.com'),
            ('G0014', 'Arvy Olof R. Waramory', 'pria', 'PPKN', 'Arvy_Presensi@gmail.com'),
            ('G0015', 'Siti Maria Tasik', 'wanita', 'Agama', 'Siti_Presensi@gmail.com'),
            ('G0016', 'Oliver Ibo', 'pria', 'Matematika', 'Oliver_Presensi@gmail.com'),
        ]

        guru_dict = {}
        for kode, nama, gender, bidang, email in guru_data:
            # Create username from email
            username = email.split('@')[0].lower()
            
            guru, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'name': nama,
                    'role': User.Role.GURU,
                    'nip': kode,
                    'is_active': True,
                }
            )
            
            if created:
                guru.set_password('ADMING')
                guru.save()
            
            guru_dict[kode] = guru
            
            # Assign mata pelajaran to guru
            if bidang in mata_pelajaran_dict:
                mapel = mata_pelajaran_dict[bidang]
                if not mapel.guru:
                    mapel.guru = guru
                    mapel.save()

        return guru_dict

    def create_kelas(self, guru_dict):
        """Create Kelas dari data SQL"""
        kelas_data = [
            ('11_A', 'XI A', 'XI', 'G0001'),
            ('11_B', 'XI B', 'XI', 'G0002'),
            ('11_C', 'XI C', 'XI', 'G0003'),
            ('11_D', 'XI D', 'XI', 'G0004'),
            ('11_E_ipa', 'XI E IPA', 'XI', 'G0005'),
            ('12_A', 'XII A', 'XII', 'G0006'),
            ('12_B', 'XII B', 'XII', 'G0007'),
            ('12_C', 'XII C', 'XII', 'G0008'),
            ('12_D', 'XII D', 'XII', 'G0009'),
            ('12_E', 'XII E', 'XII', 'G0010'),
        ]

        kelas_dict = {}
        for kode, nama, tingkat, kode_wali in kelas_data:
            wali_guru = guru_dict.get(kode_wali)
            
            kelas, created = Kelas.objects.get_or_create(
                nama=nama,
                defaults={
                    'kode': kode,
                    'tingkat': tingkat,
                    'tahun_ajaran': '2024/2025',
                    'wali_guru': wali_guru,
                }
            )
            
            kelas_dict[kode] = kelas

        return kelas_dict

    def create_siswa(self, kelas_dict):
        """Create Siswa dari data SQL"""
        siswa_data = [
            # Kelas 11_A
            ('0098618574', 'Albertho Katto', 'pria', '11_A', 'albertho_Presensi@gmail.com'),
            ('0093195771', 'Alexandro Juan Fabiano Syaranamual', 'pria', '11_A', 'alexandro_Presensi@gmail.com'),
            ('0093760051', 'Alfaro William Miller Ropu', 'pria', '11_A', 'alfaro_Presensi@gmail.com'),
            ('0083535467', 'Anton Yansip', 'pria', '11_A', 'anton_Presensi@gmail.com'),
            ('0089298173', 'Christine Solagratia Olua', 'wanita', '11_A', 'christine_Presensi@gmail.com'),
            ('0083601202', 'Davinci Julio Okomanop', 'pria', '11_A', 'davinci_Presensi@gmail.com'),
            ('0096685886', 'Fran Kwasuk Wesapla', 'pria', '11_A', 'fran_Presensi@gmail.com'),
            ('0099633465', 'Gregorius P. Sopaheluwakan', 'pria', '11_A', 'gregorius_Presensi@gmail.com'),
            ('3089639438', 'Hesron Abraham Dude', 'pria', '11_A', 'hesron_Presensi@gmail.com'),
            ('0091646009', 'Jelove Q.R Karafir Renwarin', 'wanita', '11_A', 'jelove_Presensi@gmail.com'),
            ('0099270210', 'Jesicca Welfina Rode Awes', 'wanita', '11_A', 'jesicca_Presensi@gmail.com'),
            ('0103986170', 'Kingsley Abriel Mbatu', 'pria', '11_A', 'kingsley_Presensi@gmail.com'),
            ('3072509064', 'Milison Wakur', 'pria', '11_A', 'milison_Presensi@gmail.com'),
            ('0091344625', 'Minola Nistela Yewi', 'wanita', '11_A', 'minola_Presensi@gmail.com'),
            ('3046297908', 'Mistail Tabuni', 'pria', '11_A', 'mistail_Presensi@gmail.com'),
            ('0102057795', 'Natalia Pahabol', 'wanita', '11_A', 'natalia_Presensi@gmail.com'),
            ('0085675221', 'Panat Alona Nirigi', 'wanita', '11_A', 'panat_Presensi@gmail.com'),
            ('3066450751', 'Rohan G.G Pagawak', 'pria', '11_A', 'rohan_Presensi@gmail.com'),
            ('0081029267', 'Rolince Koranue', 'wanita', '11_A', 'rolince_Presensi@gmail.com'),
            ('0098381767', 'Sadrak Hopni Aliknoe', 'pria', '11_A', 'sadrak_Presensi@gmail.com'),
            ('0081029284', 'Salomina T Sama', 'wanita', '11_A', 'salomina_Presensi@gmail.com'),
            ('0084043502', 'Tenci Desti Daimoe', 'wanita', '11_A', 'tenci_Presensi@gmail.com'),
            ('0092291332', 'Yespina Ivoni Lissa Wasahe', 'wanita', '11_A', 'yespina_Presensi@gmail.com'),
            
            # Kelas 11_B
            ('0099980165', 'Agnes Lorina Marchella Yonkoi Tungkoye', 'wanita', '11_B', 'agnes_Presensi@gmail.com'),
            ('3072283985', 'Albertz Cartensliving Daimoi', 'pria', '11_B', 'albertz_Presensi@gmail.com'),
            ('0085962247', 'Aldo Alfredo Duma Weya', 'pria', '11_B', 'aldo_Presensi@gmail.com'),
            ('0092802610', 'Alfonsina Christalin Wally', 'wanita', '11_B', 'alfonsina_Presensi@gmail.com'),
            ('3068503174', 'Andi Uopdana', 'pria', '11_B', 'andi_Presensi@gmail.com'),
            ('0097438915', 'Charles Joni Pigai', 'pria', '11_B', 'charles_Presensi@gmail.com'),
            ('3088503254', 'Debby Debora Mehue', 'wanita', '11_B', 'debby_Presensi@gmail.com'),
            ('0073509285', 'Doki Uropmabin', 'pria', '11_B', 'doki_Presensi@gmail.com'),
            ('0083878987', 'Eparans Yustus Awoitauw', 'pria', '11_B', 'eparans_Presensi@gmail.com'),
            ('0099080609', 'Imanuel I.J Kambue', 'pria', '11_B', 'imanuel_Presensi@gmail.com'),
            ('0077432181', 'Israel R.S Nukuboy', 'pria', '11_B', 'israel_Presensi@gmail.com'),
            ('0094924109', 'Ivana Patra T. M. Sroyer', 'wanita', '11_B', 'ivana_Presensi@gmail.com'),
            ('0081775433', 'Jaqualine Olga Novita Kofit', 'wanita', '11_B', 'jaqualine_Presensi@gmail.com'),
            ('0099960441', 'Jisrael Lodewik Kogoya', 'pria', '11_B', 'jisrael_Presensi@gmail.com'),
            ('0089300578', 'Kevin Barack Yamboisembut', 'pria', '11_B', 'kevin_Presensi@gmail.com'),
            ('0103049881', 'Lady Lea Regina Yarona', 'wanita', '11_B', 'lady_Presensi@gmail.com'),
            ('0081971422', 'Martina Kaway', 'wanita', '11_B', 'martina_Presensi@gmail.com'),
            ('3101178217', 'Meilda Febriana Magai', 'wanita', '11_B', 'meilda_Presensi@gmail.com'),
            ('0082436923', 'Melisa Telenggen', 'wanita', '11_B', 'melisa_Presensi@gmail.com'),
            ('0092233281', 'Moris Cerullo Yarusabra', 'pria', '11_B', 'moris_Presensi@gmail.com'),
            ('0099514856', 'Robinnho C.H Gundi Enembe', 'pria', '11_B', 'robinnho_Presensi@gmail.com'),
            ('0097047650', 'Shanice Constance P.S Massie', 'wanita', '11_B', 'shanice_Presensi@gmail.com'),
            ('0081448327', 'Sergio Elisama Aronggear', 'pria', '11_B', 'sergio_Presensi@gmail.com'),
            ('0096200373', 'Vranklin Numberi', 'pria', '11_B', 'vranklin_Presensi@gmail.com'),
            ('0095713964', 'Wisnu Nur Ajemi', 'pria', '11_B', 'wisnu_Presensi@gmail.com'),
            ('0091229912', 'Yaap Paulus Papara', 'pria', '11_B', 'yaap_Presensi@gmail.com'),
            ('0096848497', 'Yusuf Ronny Yaboisembut', 'pria', '11_B', 'yusuf_Presensi@gmail.com'),

            # Kelas 11_C (24 siswa)
            ('0086974439', 'Agustian Imanuel Lokbere', 'pria', '11_C', 'agustian_Presensi@gmail.com'),
            ('0097115314', 'Alberto Aldry Pongayow', 'pria', '11_C', 'alberto_Presensi@gmail.com'),
            ('3104543944', 'Aldo Dewa Aster Krey', 'pria', '11_C', 'aldo_krey_Presensi@gmail.com'),
            ('0093269643', 'Alexandra Meyer Damoye', 'wanita', '11_C', 'alexandra_Presensi@gmail.com'),
            ('0092179574', 'Blandina Teresia Pangkatana', 'wanita', '11_C', 'blandina_Presensi@gmail.com'),
            ('3085268395', 'Butet Ocelin Malong', 'wanita', '11_C', 'butet_Presensi@gmail.com'),
            ('0085041799', 'Christiani Manuela Payokwa', 'wanita', '11_C', 'christiani_Presensi@gmail.com'),
            ('0082166597', 'Cornelis Septino Karma', 'pria', '11_C', 'cornelis_Presensi@gmail.com'),
            ('0092021947', 'Debora Grace Adelia Demetouw', 'wanita', '11_C', 'debora_Presensi@gmail.com'),
            ('0106424175', 'David Wilson Y. Dike', 'pria', '11_C', 'david_Presensi@gmail.com'),
            ('0081367419', 'Eliezer Darongke Tumuatja', 'pria', '11_C', 'eliezer_Presensi@gmail.com'),
            ('0091174638', 'Feyzan Rodry Was', 'pria', '11_C', 'feyzan_Presensi@gmail.com'),
            ('0092196617', 'Izaskar Yosef Hokoyoku', 'pria', '11_C', 'izaskar_Presensi@gmail.com'),
            ('3099163799', 'Jesen Narzul Yustus Sembai', 'pria', '11_C', 'jesen_Presensi@gmail.com'),
            ('0095198495', 'Jhosua Boaz Daniel Sesa', 'pria', '11_C', 'jhosua_Presensi@gmail.com'),
            ('0078207422', 'Katrin Anjelika Mansawan', 'wanita', '11_C', 'katrin_Presensi@gmail.com'),
            ('3082599989', 'Lukas Robert Pangkatana', 'pria', '11_C', 'lukas_Presensi@gmail.com'),
            ('0096965461', 'Nelcy Nety Kromsian', 'wanita', '11_C', 'nelcy_Presensi@gmail.com'),
            ('0097979076', 'Philip John Marvic Ohee', 'pria', '11_C', 'philip_Presensi@gmail.com'),
            ('0091103685', 'Reza Petur Erwin Tokoro', 'pria', '11_C', 'reza_Presensi@gmail.com'),
            ('0077147394', 'Sergio Sem', 'pria', '11_C', 'sergio_sem_Presensi@gmail.com'),
            ('0083685472', 'Steven Wahyu Taime', 'pria', '11_C', 'steven_Presensi@gmail.com'),
            ('3084763997', 'Syallom Marsela Yepasedanya', 'wanita', '11_C', 'syallom_Presensi@gmail.com'),

            # Kelas 11_D (20 siswa)
            ('3097106599', 'Agnesia Bristneva Natalia Yikwa', 'wanita', '11_D', 'agnesia_Presensi@gmail.com'),
            ('0091111913', 'Absalom Matheis Buce Bathkorumbawa', 'pria', '11_D', 'absalom_Presensi@gmail.com'),
            ('0099131618', 'Albertho K. Ramandei', 'pria', '11_D', 'albertho_ramandei_Presensi@gmail.com'),
            ('0085560221', 'Alfason Heipon', 'pria', '11_D', 'alfason_Presensi@gmail.com'),
            ('0086008629', 'Aryan Melky Stenly Ujabi', 'pria', '11_D', 'aryan_Presensi@gmail.com'),
            ('3080694461', 'Bob Robert Tasti', 'pria', '11_D', 'bob_Presensi@gmail.com'),
            ('0086380232', 'Christiano Abraham Kreutha', 'pria', '11_D', 'christiano_Presensi@gmail.com'),
            ('0085158462', 'Dianifa Sesewano', 'wanita', '11_D', 'dianifa_Presensi@gmail.com'),
            ('0098888279', 'Erfiana Halitopo', 'wanita', '11_D', 'erfiana_Presensi@gmail.com'),
            ('0082027449', 'Ester Dike', 'wanita', '11_D', 'ester_dike_Presensi@gmail.com'),
            ('0076850207', 'Firman Kogoya', 'pria', '11_D', 'firman_Presensi@gmail.com'),
            ('0098352549', 'Granier Juan Roberth Suebu', 'pria', '11_D', 'granier_Presensi@gmail.com'),
            ('0104983239', 'Grassela Victorya Ayu Kamsy', 'wanita', '11_D', 'grassela_Presensi@gmail.com'),
            ('0084150777', 'M. Albadiu Ramadan', 'pria', '11_D', 'albadiu_Presensi@gmail.com'),
            ('0087340717', 'Marlina Suebu', 'wanita', '11_D', 'marlina_suebu_Presensi@gmail.com'),
            ('0087531078', 'Novalia Samonsabra', 'wanita', '11_D', 'novalia_Presensi@gmail.com'),
            ('0085096315', 'Tiery Henry V. Warinusi', 'pria', '11_D', 'tiery_Presensi@gmail.com'),
            ('0099622063', 'Wafuway Sem Seseray', 'pria', '11_D', 'wafuway_Presensi@gmail.com'),
            ('0092922277', 'Yeni Kristin Yarisetouw', 'wanita', '11_D', 'yeni_Presensi@gmail.com'),
            ('0091677166', 'Yuliance Oiwari', 'wanita', '11_D', 'yuliance_Presensi@gmail.com'),

            # Kelas 11_E_ipa (30 siswa)
            ('0104063472', 'Alfian Magnus Simbiak', 'pria', '11_E_ipa', 'alfian_Presensi@gmail.com'),
            ('3109905681', 'Anna Margaretha Farwas', 'wanita', '11_E_ipa', 'anna_Presensi@gmail.com'),
            ('0086644173', 'Belessing Elisabeth J.N.J Sasarari', 'wanita', '11_E_ipa', 'belessing_Presensi@gmail.com'),
            ('0083529191', 'Chevin Afasedanya', 'pria', '11_E_ipa', 'chevin_Presensi@gmail.com'),
            ('0108214276', 'Claudya Lidya G. Koroba', 'wanita', '11_E_ipa', 'claudya_Presensi@gmail.com'),
            ('0092544952', 'CLay H.F. Tembesing', 'pria', '11_E_ipa', 'clay_Presensi@gmail.com'),
            ('0109331811', 'Febrian Edison Done', 'pria', '11_E_ipa', 'febrian_Presensi@gmail.com'),
            ('0104207166', 'Feronika Papuana Eklesia Ela Kambu', 'wanita', '11_E_ipa', 'feronika_Presensi@gmail.com'),
            ('0092695326', 'Gabriel Awipapa Gaipo Edowai', 'pria', '11_E_ipa', 'gabriel_edowai_Presensi@gmail.com'),
            ('3091100873', 'Gracia Kambuaya', 'wanita', '11_E_ipa', 'gracia_Presensi@gmail.com'),
            ('0109947146', 'Harthatia Yikwa', 'wanita', '11_E_ipa', 'harthatia_Presensi@gmail.com'),
            ('0097381330', 'Jacky Raman Kagaikebo Edowai', 'pria', '11_E_ipa', 'jacky_Presensi@gmail.com'),
            ('3104826320', 'Jesaya Putra Pamando Weya', 'pria', '11_E_ipa', 'jesaya_Presensi@gmail.com'),
            ('0098591024', 'Johan Wihell Mambraku', 'pria', '11_E_ipa', 'johan_Presensi@gmail.com'),
            ('0107240383', 'John Piter Pangkatana', 'pria', '11_E_ipa', 'john_pangkatana_Presensi@gmail.com'),
            ('0094457389', 'Jufred Olmerd Sinery', 'pria', '11_E_ipa', 'jufred_Presensi@gmail.com'),
            ('0095154329', 'Juninho Sampary Mambrasar', 'pria', '11_E_ipa', 'juninho_Presensi@gmail.com'),
            ('0095147370', 'Lynette Tiffanie Vanessa Kafiar', 'wanita', '11_E_ipa', 'lynette_Presensi@gmail.com'),
            ('0093847420', 'Marthina Melanovich Yekusamon', 'wanita', '11_E_ipa', 'Marthina_Presensi@gmail.com'),
            ('0104307137', 'Mia Maria Betelop Saikembet', 'wanita', '11_E_ipa', 'Mia_Presensi@gmail.com'),
            ('3101060288', 'Olivia Mahrid Entong', 'wanita', '11_E_ipa', 'Olivia_Mahrid_Presensi@gmail.com'),
            ('0097005596', 'Pearly Gwenlee Watory', 'wanita', '11_E_ipa', 'Pearly_Gwenlee_Presensi@gmail.com'),
            ('0104703659', 'Perigrinus Petrado Ogi Charles', 'pria', '11_E_ipa', 'Perigrinus_Petrado_Presensi@gmail.com'),
            ('0118392568', 'Rehuela Zahra Golda Meyer Karubaba', 'wanita', '11_E_ipa', 'Rehuela_Zahra_Presensi@gmail.com'),
            ('0092535734', 'Scholastika Olin Aprilia Kanath', 'wanita', '11_E_ipa', 'Scholastika_Olin_Presensi@gmail.com'),
            ('0098651369', 'Selpiana Daimoe', 'wanita', '11_E_ipa', 'Selpiana_Daimoe_Presensi@gmail.com'),
            ('0093061686', 'Tifany Aurelya Mambu', 'pria', '11_E_ipa', 'Tifany_Aurelya_Presensi@gmail.com'),
            ('0101660372', 'Timothy Carlos Runtuwene', 'pria', '11_E_ipa', 'Timothy_Carlos_Presensi@gmail.com'),
            ('0096830872', 'Vanessa Sisilia Kaway', 'wanita', '11_E_ipa', 'Vanessa_Sisilia_Presensi@gmail.com'),
            ('0097296168', 'Villia Michelle Maay', 'wanita', '11_E_ipa', 'Villia_Michelle_Presensi@gmail.com'),
            ('3084975464', 'Welsa Asria Rogi', 'wanita', '11_E_ipa', 'Welsa_Asria_Presensi@gmail.com'),

            # Kelas 12_A (21 siswa)
            ('0073498380', 'Adriel Marcus', 'pria', '12_A', 'Adriel_Presensi@gmail.com'),
            ('0082140232', 'Apriano Adriyansyah Manansang', 'pria', '12_A', 'Apriano_Presensi@gmail.com'),
            ('3090437027', 'Batseba Kaway', 'wanita', '12_A', 'Batseba_Presensi@gmail.com'),
            ('0071360017', 'Clara Elisabeth Deda', 'wanita', '12_A', 'Clara_Presensi@gmail.com'),
            ('0071008010', 'Erick Zonggonau', 'pria', '12_A', 'Erick_Presensi@gmail.com'),
            ('3074704305', 'Ester Rosalina Wandik', 'wanita', '12_A', 'Ester_Wandik_Presensi@gmail.com'),
            ('0089870212', 'Eunice Aveska Massie', 'wanita', '12_A', 'Eunice_Presensi@gmail.com'),
            ('0081983342', 'Febriana Silviana Ayakeding', 'wanita', '12_A', 'Febriana_Presensi@gmail.com'),
            ('3082987097', 'Gloria Cindy Kalasina Marani', 'wanita', '12_A', 'Gloria_Presensi@gmail.com'),
            ('0061772631', 'Herlina Belandina Kaway', 'wanita', '12_A', 'Herlina_Presensi@gmail.com'),
            ('0071171615', 'Herlince Beanal', 'wanita', '12_A', 'Herlince_Presensi@gmail.com'),
            ('0088495953', 'Juan Richard Monim', 'pria', '12_A', 'Juan_Presensi@gmail.com'),
            ('3062573461', 'Kristi Yunita Kum', 'wanita', '12_A', 'Kristi_Presensi@gmail.com'),
            ('0074462042', 'Matius Yulius Kemusabra', 'pria', '12_A', 'Matius_Kemusabra_Presensi@gmail.com'),
            ('0081932877', 'Mc. Casey Jonathan Semet', 'pria', '12_A', 'Mc_Casey_Presensi@gmail.com'),
            ('0062452884', 'Melky Stenly Niwilingame', 'pria', '12_A', 'Melky_Presensi@gmail.com'),
            ('0077796595', 'Rio Mina Koranue', 'pria', '12_A', 'Rio_Mina_Presensi@gmail.com'),
            ('3086113333', 'Rully Spanya Taime', 'pria', '12_A', 'Rully_Spanya_Presensi@gmail.com'),
            ('0074800621', 'Sabrina Rosyendi Krey', 'wanita', '12_A', 'Sabrina_Rosyendi_Presensi@gmail.com'),
            ('3061451714', 'Samuel Eto Kogoya', 'pria', '12_A', 'Samuel_Eto_Presensi@gmail.com'),
            ('0067680480', 'Sila Ware', 'wanita', '12_A', 'Sila_Ware_Presensi@gmail.com'),

            # Kelas 12_B (17 siswa)
            ('3094830928', 'Amanda Waker', 'wanita', '12_B', 'Amanda_Presensi@gmail.com'),
            ('0083880202', 'Emanuel Oromji', 'pria', '12_B', 'Emanuel_Presensi@gmail.com'),
            ('0088135704', 'Febrio Kafiar', 'pria', '12_B', 'Febrio_Presensi@gmail.com'),
            ('0087232572', 'Gabriel Made Faidiban', 'pria', '12_B', 'Gabriel_Faidiban_Presensi@gmail.com'),
            ('0086784562', 'Gabriela Janampa', 'wanita', '12_B', 'Gabriela_Presensi@gmail.com'),
            ('3088959346', 'Gersom Wenda', 'pria', '12_B', 'Gersom_Presensi@gmail.com'),
            ('0084016967', 'Grace Mulait', 'wanita', '12_B', 'Grace_Presensi@gmail.com'),
            ('0085511247', 'Kaleb Gasper Daimoye', 'pria', '12_B', 'Kaleb_Presensi@gmail.com'),
            ('3083971237', 'Malin Beanal', 'wanita', '12_B', 'Malin_Presensi@gmail.com'),
            ('0094572325', 'Marget Elis Samonsabra', 'wanita', '12_B', 'Marget_Presensi@gmail.com'),
            ('0052654820', 'Oktovina Ware', 'wanita', '12_B', 'Oktovina_Presensi@gmail.com'),
            ('0078084151', 'Otalina Epety', 'wanita', '12_B', 'Otalina_Epety_Presensi@gmail.com'),
            ('0099898294', 'Palda Yenny Kogoya', 'wanita', '12_B', 'Palda_Yenny_Presensi@gmail.com'),
            ('3081583118', 'Rahamzes Wandikbo', 'pria', '12_B', 'Rahamzes_Presensi@gmail.com'),
            ('0079067926', 'Selviana Nerokepouw', 'wanita', '12_B', 'Selviana_Nerokepouw_Presensi@gmail.com'),
            ('0054419355', 'Tibor Donatus Kutapo', 'pria', '12_B', 'Tibor_Donatus_Presensi@gmail.com'),
            ('0068254249', 'Tina Elopere', 'wanita', '12_B', 'Tina_Elopere_Presensi@gmail.com'),

            # Kelas 12_C (27 siswa)
            ('0088424171', 'Antonio Fernando Tungkoye', 'pria', '12_C', 'Antonio_Presensi@gmail.com'),
            ('0900000010', 'Beby Uamang', 'pria', '12_C', 'Beby_Presensi@gmail.com'),
            ('0075996570', 'Bonifacius Timang', 'pria', '12_C', 'Bonifacius_Presensi@gmail.com'),
            ('0065202414', 'Boper Wandikbo', 'pria', '12_C', 'Boper_Presensi@gmail.com'),
            ('0074241068', 'Dancelina W. Tauruy', 'wanita', '12_C', 'Dancelina_Presensi@gmail.com'),
            ('0089354744', 'Devit Isak Pakage', 'pria', '12_C', 'Devit_Presensi@gmail.com'),
            ('0072032727', 'Heberth Suebu', 'pria', '12_C', 'Heberth_Presensi@gmail.com'),
            ('0082265872', 'Julio Dedek Cahyo Gunawan', 'pria', '12_C', 'Julio_Gunawan_Presensi@gmail.com'),
            ('0060118207', 'Karel Kamani', 'pria', '12_C', 'Karel_Presensi@gmail.com'),
            ('0082690268', 'Konda Daverson Yikwa', 'pria', '12_C', 'Konda_Presensi@gmail.com'),
            ('0085948889', 'Lionel Mc. Farlan Wonua', 'pria', '12_C', 'Lionel_Presensi@gmail.com'),
            ('3069710479', 'Moricus Biporo', 'pria', '12_C', 'Moricus_Presensi@gmail.com'),
            ('0072870397', 'Natalis Epere', 'pria', '12_C', 'Natalis_Presensi@gmail.com'),
            ('0086816842', 'Nikson Mario Pangkatana', 'pria', '12_C', 'Nikson_Pangkatana_Presensi@gmail.com'),
            ('0083538462', 'Nintius Bugiangge', 'pria', '12_C', 'Nintius_Presensi@gmail.com'),
            ('0044459196', 'Ones Tusep', 'pria', '12_C', 'Ones_Tusep_Presensi@gmail.com'),
            ('0064040915', 'Peniau Uamang', 'pria', '12_C', 'Peniau_Uamang_Presensi@gmail.com'),
            ('0085211261', 'Priscilia Titi Awoitauw', 'wanita', '12_C', 'Pricilia_Presensi@gmail.com'),
            ('3073307191', 'Rafenelli R. Suebu', 'pria', '12_C', 'Rafenelli_Presensi@gmail.com'),
            ('0084640307', 'Rudi Ciae', 'pria', '12_C', 'Rudi_Ciae_Presensi@gmail.com'),
            ('0083069288', 'Samuel Yakobus Dimor', 'pria', '12_C', 'Samuel_Yakobus_Presensi@gmail.com'),
            ('0089009008', 'Siane Nukuboy', 'wanita', '12_C', 'Siane_Nukuboy_Presensi@gmail.com'),
            ('0062077650', 'Soleman Gidion Philipus Mayai', 'pria', '12_C', 'Soleman_Gidion_Presensi@gmail.com'),
            ('3052423537', 'Solminus Deikme', 'pria', '12_C', 'Solminus_Deikme_Presensi@gmail.com'),
            ('0086157243', 'Susan Alfonsina G. Agaki', 'wanita', '12_C', 'Susan_Alfonsina_Presensi@gmail.com'),
            ('0082439929', 'Yakob Jeck Bonsapia', 'pria', '12_C', 'Yakob_Jeck_Presensi@gmail.com'),
            ('0087958741', 'Yomahe Haren Ruth Murib', 'wanita', '12_C', 'Yomahe_Haren_Presensi@gmail.com'),

            # Kelas 12_D (28 siswa)
            ('0098228323', 'Albert Frits Armand Wayoi', 'pria', '12_D', 'Albert_Wayoi_Presensi@gmail.com'),
            ('0028846671', 'Agustinus Bukaleng', 'pria', '12_D', 'Agustinus_Presensi@gmail.com'),
            ('0087846332', 'Aldo Stenly Baransay', 'pria', '12_D', 'Aldo_Baransay_Presensi@gmail.com'),
            ('0064696864', 'Alex Beanal', 'pria', '12_D', 'Alex_Beanal_Presensi@gmail.com'),
            ('0059322562', 'Alex Kelabetme', 'pria', '12_D', 'Alex_Kelabetme_Presensi@gmail.com'),
            ('0087497638', 'Alfrida Ruth Telenggen', 'wanita', '12_D', 'Alfrida_Ruth_Presensi@gmail.com'),
            ('0053817232', 'Andri Natkime', 'pria', '12_D', 'Andri_Presensi@gmail.com'),
            ('0088974207', 'Apetinus Magal', 'pria', '12_D', 'Apetinus_Presensi@gmail.com'),
            ('0087997389', 'Daud M. Nabyal', 'pria', '12_D', 'Daud_Presensi@gmail.com'),
            ('0061510081', 'Demison Enembe', 'pria', '12_D', 'Demison_Presensi@gmail.com'),
            ('0088148779', 'Dion Firgi Nukubol', 'pria', '12_D', 'Dion_Presensi@gmail.com'),
            ('0054078855', 'Edison Kelabetme', 'pria', '12_D', 'Edison_Kelabetme_Presensi@gmail.com'),
            ('0076235525', 'Ferdi Sani', 'pria', '12_D', 'Ferdi_Presensi@gmail.com'),
            ('0073272096', 'Gracella Novita Baab', 'wanita', '12_D', 'Gracella_Presensi@gmail.com'),
            ('0076337933', 'Heni Meriesca Tokoro', 'wanita', '12_D', 'Heni_Presensi@gmail.com'),
            ('0050000001', 'Hilarius Kaimop', 'pria', '12_D', 'Hilarius_Presensi@gmail.com'),
            ('0074101778', 'Lenora Melangsena', 'wanita', '12_D', 'Lenora_Presensi@gmail.com'),
            ('3072951366', 'Lewi Uropmabin', 'pria', '12_D', 'Lewi_Presensi@gmail.com'),
            ('3055007890', 'Mince Yuliana Gwenjau', 'wanita', '12_D', 'Mince_Presensi@gmail.com'),
            ('0081057930', 'Novi Kum', 'wanita', '12_D', 'Novi_Presensi@gmail.com'),
            ('0063381953', 'Oktovianus Kreutha', 'pria', '12_D', 'Oktovianus_Presensi@gmail.com'),
            ('0088147134', 'Olivia Fradela Ericha Wally', 'wanita', '12_D', 'Olivia_Wally_Presensi@gmail.com'),
            ('0033003446', 'Onivrina Nosolanemeng Kibak Magal', 'pria', '12_D', 'Onivrina_Nosolanemeng_Presensi@gmail.com'),
            ('3109794979', 'Perinus Beanal', 'pria', '12_D', 'Perinus_Beanal_Presensi@gmail.com'),
            ('0700000002', 'Serinus Dimpau', 'pria', '12_D', 'Serinus_Dimpau_Presensi@gmail.com'),
            ('3055208966', 'Talciau Uamang', 'pria', '12_D', 'Talciau_Uamang_Presensi@gmail.com'),
            ('3079789256', 'Tatimaida Jikwa', 'wanita', '12_D', 'Tatimaida_Presensi@gmail.com'),
            ('0048921163', 'Terpianus Janampa', 'pria', '12_D', 'Terpianus_Janampa_Presensi@gmail.com'),
            ('3062426887', 'Yohanes Gwenjau', 'pria', '12_D', 'Yohanes_Gwenjau_Presensi@gmail.com'),

            # Kelas 12_E (27 siswa)
            ('0057247917', 'Agus Indri', 'pria', '12_E', 'Agus_Presensi@gmail.com'),
            ('0075374112', 'Alvin Asso', 'pria', '12_E', 'Alvin_Presensi@gmail.com'),
            ('0077550009', 'Antonius Timang', 'pria', '12_E', 'Antonius_Timang_Presensi@gmail.com'),
            ('0083129655', 'Anjas Fernando Marweri', 'pria', '12_E', 'Anjas_Presensi@gmail.com'),
            ('0071987936', 'Atael Wandagau', 'pria', '12_E', 'Atael_Presensi@gmail.com'),
            ('3040341417', 'Eminus Ogolmagay', 'pria', '12_E', 'Eminus_Presensi@gmail.com'),
            ('3077922855', 'Eranus Kogoya', 'pria', '12_E', 'Eranus_Presensi@gmail.com'),
            ('0077787130', 'Jerry Jacob Yom', 'pria', '12_E', 'Jerry_Presensi@gmail.com'),
            ('0081206127', 'Johanes Faidiban', 'pria', '12_E', 'Johanes_Faidiban_Presensi@gmail.com'),
            ('0048875440', 'Jorinus Deikme', 'pria', '12_E', 'Jorinus_Presensi@gmail.com'),
            ('0083815549', 'Julio Samuel Rumbairusi', 'pria', '12_E', 'Julio_Rumbairusi_Presensi@gmail.com'),
            ('0088714058', 'Junelda Trapen', 'wanita', '12_E', 'Junelda_Presensi@gmail.com'),
            ('0087444931', 'Kristian Bonsapia', 'pria', '12_E', 'Kristian_Presensi@gmail.com'),
            ('0087123010', 'Mario Geits Nataniel Yappo', 'pria', '12_E', 'Mario_Presensi@gmail.com'),
            ('2067641192', 'Matius Yunus Uamang', 'pria', '12_E', 'Matius_Uamang_Presensi@gmail.com'),
            ('0085167438', 'Natalia Jelika Yom', 'wanita', '12_E', 'Natalia_Yom_Presensi@gmail.com'),
            ('3057349810', 'Pontus Uamang', 'pria', '12_E', 'Pontus_Presensi@gmail.com'),
            ('0079462486', 'Rahel I. Nukuboy', 'wanita', '12_E', 'Rahel_Nukuboy_Presensi@gmail.com'),
            ('0063472109', 'Rani Uamang', 'wanita', '12_E', 'Rani_Presensi@gmail.com'),
            ('3061407312', 'Rickardo Deisaple', 'pria', '12_E', 'Rickardo_Presensi@gmail.com'),
            ('0083339252', 'Rosalinda Eca Sokoy', 'wanita', '12_E', 'Rosalinda_Eca_Presensi@gmail.com'),
            ('0083605421', 'Rumulus Timang', 'pria', '12_E', 'Rumulus_Timang_Presensi@gmail.com'),
            ('0079829842', 'Silas J. Pangkatana', 'pria', '12_E', 'Silas_Pangkatana_Presensi@gmail.com'),
            ('0063326063', 'Silas Edwin Wikari', 'pria', '12_E', 'Silas_Edwin_Presensi@gmail.com'),
            ('0092582898', 'Yafet Kreutha', 'pria', '12_E', 'Yafet_Kreutha_Presensi@gmail.com'),
            ('0074841650', 'Yakobus Wally', 'pria', '12_E', 'Yakobus_Wally_Presensi@gmail.com'),
            ('0075716777', 'Yusmin Peyon', 'pria', '12_E', 'Yusmin_Peyon_Presensi@gmail.com'),
        ]

        total = 0
        for nim, nama, gender, kode_kelas, email in siswa_data:
            kelas = kelas_dict.get(kode_kelas)
            if not kelas:
                continue
            
            username = email.split('@')[0].lower()
            
            siswa, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'name': nama,
                    'role': User.Role.SISWA,
                    'nim': nim,
                    'is_active': True,
                }
            )
            
            if created:
                siswa.set_password('SISWA')
                siswa.save()
                total += 1
            
            # Add siswa to kelas
            SiswaKelas.objects.get_or_create(
                siswa=siswa,
                kelas=kelas
            )

        return total



