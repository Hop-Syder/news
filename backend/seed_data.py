import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'nexus_connect')]

# Demo users and entrepreneurs data
demo_data = [
    {
        "user": {
            "email": "amina.diallo@example.com",
            "password": "demo123",
            "firstName": "Amina",
            "lastName": "Diallo"
        },
        "entrepreneur": {
            "profileType": "freelance",
            "firstName": "Amina",
            "lastName": "Diallo",
            "companyName": "",
            "activityName": "Designer Graphique & UI/UX",
            "description": "Designer passionnée avec 5 ans d'expérience. Création de logos, identités visuelles et interfaces modernes pour startups africaines.",
            "tags": ["Design", "UI/UX", "Branding", "Logo", "Illustration"],
            "phone": "+221 77 123 4567",
            "whatsapp": "+221 77 123 4567",
            "email": "amina.diallo@example.com",
            "location": "SN",
            "city": "Dakar",
            "website": "https://aminadesign.com",
            "rating": 4.8,
            "reviewCount": 24,
            "isPremium": True
        }
    },
    {
        "user": {
            "email": "kofi.mensah@example.com",
            "password": "demo123",
            "firstName": "Kofi",
            "lastName": "Mensah"
        },
        "entrepreneur": {
            "profileType": "entreprise",
            "firstName": "Kofi",
            "lastName": "Mensah",
            "companyName": "TechStart Ghana",
            "activityName": "Développement Web & Mobile",
            "description": "Startup tech spécialisée dans le développement d'applications mobiles et web pour entreprises. Solutions innovantes et sur-mesure.",
            "tags": ["Développement", "Mobile", "Web", "React", "Python"],
            "phone": "+233 24 567 8901",
            "whatsapp": "+233 24 567 8901",
            "email": "kofi.mensah@example.com",
            "location": "GH",
            "city": "Accra",
            "website": "https://techstartghana.com",
            "rating": 4.9,
            "reviewCount": 38,
            "isPremium": True
        }
    },
    {
        "user": {
            "email": "fatou.toure@example.com",
            "password": "demo123",
            "firstName": "Fatou",
            "lastName": "Touré"
        },
        "entrepreneur": {
            "profileType": "artisan",
            "firstName": "Fatou",
            "lastName": "Touré",
            "companyName": "",
            "activityName": "Artisanat Textile & Mode",
            "description": "Artisan textile spécialisée dans les tissus africains. Création de vêtements traditionnels et modernes avec tissus bogolan et bazin.",
            "tags": ["Textile", "Mode", "Artisanat", "Bogolan", "Couture"],
            "phone": "+223 76 234 5678",
            "whatsapp": "+223 76 234 5678",
            "email": "fatou.toure@example.com",
            "location": "ML",
            "city": "Bamako",
            "website": "",
            "rating": 4.7,
            "reviewCount": 15,
            "isPremium": False
        }
    },
    {
        "user": {
            "email": "jean.kouassi@example.com",
            "password": "demo123",
            "firstName": "Jean",
            "lastName": "Kouassi"
        },
        "entrepreneur": {
            "profileType": "pme",
            "firstName": "Jean",
            "lastName": "Kouassi",
            "companyName": "Agro Business CI",
            "activityName": "Agriculture & Export",
            "description": "PME agricole spécialisée dans la production et l'export de cacao, café et noix de cajou. Partenariats avec coopératives locales.",
            "tags": ["Agriculture", "Export", "Cacao", "Café", "Commerce"],
            "phone": "+225 07 345 6789",
            "whatsapp": "+225 07 345 6789",
            "email": "jean.kouassi@example.com",
            "location": "CI",
            "city": "Abidjan",
            "website": "https://agrobusinessci.com",
            "rating": 4.6,
            "reviewCount": 12,
            "isPremium": False
        }
    },
    {
        "user": {
            "email": "ada.okonkwo@example.com",
            "password": "demo123",
            "firstName": "Ada",
            "lastName": "Okonkwo"
        },
        "entrepreneur": {
            "profileType": "freelance",
            "firstName": "Ada",
            "lastName": "Okonkwo",
            "companyName": "",
            "activityName": "Marketing Digital & SEO",
            "description": "Experte en marketing digital avec focus sur SEO et social media. Aide les PME africaines à développer leur présence en ligne.",
            "tags": ["Marketing", "SEO", "Social Media", "Publicité", "Content"],
            "phone": "+234 80 456 7890",
            "whatsapp": "+234 80 456 7890",
            "email": "ada.okonkwo@example.com",
            "location": "NG",
            "city": "Lagos",
            "website": "https://adamarketing.ng",
            "rating": 4.9,
            "reviewCount": 45,
            "isPremium": True
        }
    },
    {
        "user": {
            "email": "pierre.soglo@example.com",
            "password": "demo123",
            "firstName": "Pierre",
            "lastName": "Soglo"
        },
        "entrepreneur": {
            "profileType": "cabinet",
            "firstName": "Pierre",
            "lastName": "Soglo",
            "companyName": "Cabinet Soglo & Associés",
            "activityName": "Conseil Juridique & Fiscal",
            "description": "Cabinet de conseil spécialisé en droit des affaires et fiscalité. Accompagnement des entreprises dans leurs démarches légales.",
            "tags": ["Juridique", "Fiscal", "Conseil", "Droit", "Business"],
            "phone": "+229 97 567 8901",
            "whatsapp": "+229 97 567 8901",
            "email": "pierre.soglo@example.com",
            "location": "BJ",
            "city": "Cotonou",
            "website": "https://cabinetsoglo.bj",
            "rating": 4.8,
            "reviewCount": 28,
            "isPremium": True
        }
    },
    {
        "user": {
            "email": "aissata.barry@example.com",
            "password": "demo123",
            "firstName": "Aïssata",
            "lastName": "Barry"
        },
        "entrepreneur": {
            "profileType": "ONG",
            "firstName": "Aïssata",
            "lastName": "Barry",
            "companyName": "Éducation Pour Tous BF",
            "activityName": "Éducation & Formation",
            "description": "ONG œuvrant pour l'accès à l'éducation dans les zones rurales. Programmes d'alphabétisation et formation professionnelle.",
            "tags": ["Éducation", "Formation", "Social", "Alphabétisation", "ONG"],
            "phone": "+226 70 678 9012",
            "whatsapp": "+226 70 678 9012",
            "email": "aissata.barry@example.com",
            "location": "BF",
            "city": "Ouagadougou",
            "website": "https://educationpourtousbf.org",
            "rating": 4.9,
            "reviewCount": 19,
            "isPremium": False
        }
    },
    {
        "user": {
            "email": "yao.akakpo@example.com",
            "password": "demo123",
            "firstName": "Yao",
            "lastName": "Akakpo"
        },
        "entrepreneur": {
            "profileType": "artisan",
            "firstName": "Yao",
            "lastName": "Akakpo",
            "companyName": "",
            "activityName": "Menuiserie & Ébénisterie",
            "description": "Artisan menuisier créant des meubles sur-mesure en bois local. Spécialité : meubles traditionnels et modernes pour maisons et bureaux.",
            "tags": ["Menuiserie", "Bois", "Meubles", "Artisanat", "Design"],
            "phone": "+228 90 789 0123",
            "whatsapp": "+228 90 789 0123",
            "email": "yao.akakpo@example.com",
            "location": "TG",
            "city": "Lomé",
            "website": "",
            "rating": 4.5,
            "reviewCount": 9,
            "isPremium": False
        }
    },
    {
        "user": {
            "email": "mariama.kante@example.com",
            "password": "demo123",
            "firstName": "Mariama",
            "lastName": "Kanté"
        },
        "entrepreneur": {
            "profileType": "entreprise",
            "firstName": "Mariama",
            "lastName": "Kanté",
            "companyName": "Beauty Africa SN",
            "activityName": "Cosmétiques Naturels",
            "description": "Entreprise de cosmétiques naturels à base de karité, baobab et autres ingrédients africains. Production locale et export régional.",
            "tags": ["Cosmétiques", "Naturel", "Karité", "Beauty", "Export"],
            "phone": "+221 77 890 1234",
            "whatsapp": "+221 77 890 1234",
            "email": "mariama.kante@example.com",
            "location": "SN",
            "city": "Thiès",
            "website": "https://beautyafricasn.com",
            "rating": 4.7,
            "reviewCount": 22,
            "isPremium": True
        }
    },
    {
        "user": {
            "email": "emmanuel.addo@example.com",
            "password": "demo123",
            "firstName": "Emmanuel",
            "lastName": "Addo"
        },
        "entrepreneur": {
            "profileType": "freelance",
            "firstName": "Emmanuel",
            "lastName": "Addo",
            "companyName": "",
            "activityName": "Photographe Professionnel",
            "description": "Photographe spécialisé dans les événements, mariages et portraits. Couverture photo et vidéo pour entreprises et particuliers.",
            "tags": ["Photographie", "Vidéo", "Événements", "Mariages", "Corporate"],
            "phone": "+233 24 901 2345",
            "whatsapp": "+233 24 901 2345",
            "email": "emmanuel.addo@example.com",
            "location": "GH",
            "city": "Kumasi",
            "website": "https://emmanuelphoto.gh",
            "rating": 4.8,
            "reviewCount": 31,
            "isPremium": False
        }
    },
    {
        "user": {
            "email": "ibrahim.sow@example.com",
            "password": "demo123",
            "firstName": "Ibrahim",
            "lastName": "Sow"
        },
        "entrepreneur": {
            "profileType": "pme",
            "firstName": "Ibrahim",
            "lastName": "Sow",
            "companyName": "Transport Express Mali",
            "activityName": "Transport & Logistique",
            "description": "PME de transport et logistique couvrant tout le Mali. Livraison rapide et sécurisée pour particuliers et entreprises.",
            "tags": ["Transport", "Logistique", "Livraison", "Fret", "Services"],
            "phone": "+223 76 012 3456",
            "whatsapp": "+223 76 012 3456",
            "email": "ibrahim.sow@example.com",
            "location": "ML",
            "city": "Sikasso",
            "website": "https://transportexpressml.com",
            "rating": 4.4,
            "reviewCount": 16,
            "isPremium": False
        }
    },
    {
        "user": {
            "email": "grace.mensah@example.com",
            "password": "demo123",
            "firstName": "Grace",
            "lastName": "Mensah"
        },
        "entrepreneur": {
            "profileType": "freelance",
            "firstName": "Grace",
            "lastName": "Mensah",
            "companyName": "",
            "activityName": "Traductrice & Interprète",
            "description": "Traductrice professionnelle FR/EN/EWE/TWI. Services de traduction de documents et interprétation pour conférences.",
            "tags": ["Traduction", "Interprétation", "Langues", "Services", "Communication"],
            "phone": "+233 54 123 4567",
            "whatsapp": "+233 54 123 4567",
            "email": "grace.mensah@example.com",
            "location": "GH",
            "city": "Accra",
            "website": "",
            "rating": 4.9,
            "reviewCount": 27,
            "isPremium": True
        }
    },
    {
        "user": {
            "email": "seydou.traore@example.com",
            "password": "demo123",
            "firstName": "Seydou",
            "lastName": "Traoré"
        },
        "entrepreneur": {
            "profileType": "artisan",
            "firstName": "Seydou",
            "lastName": "Traoré",
            "companyName": "",
            "activityName": "Maroquinerie Artisanale",
            "description": "Artisan maroquinier créant sacs, chaussures et accessoires en cuir. Travail artisanal de qualité avec designs modernes et traditionnels.",
            "tags": ["Maroquinerie", "Cuir", "Sacs", "Artisanat", "Mode"],
            "phone": "+226 70 234 5678",
            "whatsapp": "+226 70 234 5678",
            "email": "seydou.traore@example.com",
            "location": "BF",
            "city": "Bobo-Dioulasso",
            "website": "",
            "rating": 4.6,
            "reviewCount": 11,
            "isPremium": False
        }
    },
    {
        "user": {
            "email": "esther.adeyemi@example.com",
            "password": "demo123",
            "firstName": "Esther",
            "lastName": "Adeyemi"
        },
        "entrepreneur": {
            "profileType": "entreprise",
            "firstName": "Esther",
            "lastName": "Adeyemi",
            "companyName": "EduTech Nigeria",
            "activityName": "Plateforme E-learning",
            "description": "Startup edtech proposant des cours en ligne pour étudiants et professionnels. Formations certifiantes en tech, business et langues.",
            "tags": ["EdTech", "E-learning", "Formation", "Tech", "Education"],
            "phone": "+234 80 345 6789",
            "whatsapp": "+234 80 345 6789",
            "email": "esther.adeyemi@example.com",
            "location": "NG",
            "city": "Abuja",
            "website": "https://edutechnigeria.com",
            "rating": 4.8,
            "reviewCount": 42,
            "isPremium": True
        }
    },
    {
        "user": {
            "email": "laurent.hounnou@example.com",
            "password": "demo123",
            "firstName": "Laurent",
            "lastName": "Hounnou"
        },
        "entrepreneur": {
            "profileType": "cabinet",
            "firstName": "Laurent",
            "lastName": "Hounnou",
            "companyName": "Cabinet Comptable Hounnou",
            "activityName": "Expertise Comptable",
            "description": "Cabinet d'expertise comptable offrant services de comptabilité, audit et conseil financier pour PME et grandes entreprises.",
            "tags": ["Comptabilité", "Audit", "Finance", "Conseil", "Gestion"],
            "phone": "+229 97 456 7890",
            "whatsapp": "+229 97 456 7890",
            "email": "laurent.hounnou@example.com",
            "location": "BJ",
            "city": "Porto-Novo",
            "website": "https://cabinethounnou.bj",
            "rating": 4.7,
            "reviewCount": 18,
            "isPremium": False
        }
    },
    {
        "user": {
            "email": "nana.asante@example.com",
            "password": "demo123",
            "firstName": "Nana",
            "lastName": "Asante"
        },
        "entrepreneur": {
            "profileType": "entreprise",
            "firstName": "Nana",
            "lastName": "Asante",
            "companyName": "Solar Solutions Ghana",
            "activityName": "Énergie Solaire",
            "description": "Entreprise spécialisée dans l'installation de panneaux solaires résidentiels et commerciaux. Solutions d'énergie renouvelable.",
            "tags": ["Solaire", "Énergie", "Renouvelable", "Installation", "Green"],
            "phone": "+233 24 567 8901",
            "whatsapp": "+233 24 567 8901",
            "email": "nana.asante@example.com",
            "location": "GH",
            "city": "Tamale",
            "website": "https://solarsolutionsgh.com",
            "rating": 4.9,
            "reviewCount": 35,
            "isPremium": True
        }
    },
    {
        "user": {
            "email": "aminata.cisse@example.com",
            "password": "demo123",
            "firstName": "Aminata",
            "lastName": "Cissé"
        },
        "entrepreneur": {
            "profileType": "organisation",
            "firstName": "Aminata",
            "lastName": "Cissé",
            "companyName": "Femmes Entrepreneures CI",
            "activityName": "Association d'Entrepreneures",
            "description": "Organisation soutenant les femmes entrepreneures en Côte d'Ivoire. Formation, mentorat et accès au financement.",
            "tags": ["Femmes", "Entrepreneuriat", "Formation", "Mentorat", "Association"],
            "phone": "+225 07 678 9012",
            "whatsapp": "+225 07 678 9012",
            "email": "aminata.cisse@example.com",
            "location": "CI",
            "city": "Yamoussoukro",
            "website": "https://femmesentrepreneurci.org",
            "rating": 4.8,
            "reviewCount": 25,
            "isPremium": False
        }
    },
    {
        "user": {
            "email": "moussa.djibo@example.com",
            "password": "demo123",
            "firstName": "Moussa",
            "lastName": "Djibo"
        },
        "entrepreneur": {
            "profileType": "pme",
            "firstName": "Moussa",
            "lastName": "Djibo",
            "companyName": "Construction Djibo",
            "activityName": "Bâtiment & Travaux Publics",
            "description": "Entreprise de construction spécialisée dans le bâtiment résidentiel et commercial. Équipe qualifiée et projets clés en main.",
            "tags": ["Construction", "Bâtiment", "BTP", "Rénovation", "Immobilier"],
            "phone": "+227 90 789 0123",
            "whatsapp": "+227 90 789 0123",
            "email": "moussa.djibo@example.com",
            "location": "NE",
            "city": "Niamey",
            "website": "https://constructiondjibo.ne",
            "rating": 4.5,
            "reviewCount": 14,
            "isPremium": False
        }
    },
    {
        "user": {
            "email": "khadija.fall@example.com",
            "password": "demo123",
            "firstName": "Khadija",
            "lastName": "Fall"
        },
        "entrepreneur": {
            "profileType": "freelance",
            "firstName": "Khadija",
            "lastName": "Fall",
            "companyName": "",
            "activityName": "Consultante RH",
            "description": "Consultante en ressources humaines aidant les entreprises dans le recrutement, formation et gestion des talents.",
            "tags": ["RH", "Recrutement", "Formation", "Conseil", "Management"],
            "phone": "+221 77 890 1234",
            "whatsapp": "+221 77 890 1234",
            "email": "khadija.fall@example.com",
            "location": "SN",
            "city": "Saint-Louis",
            "website": "",
            "rating": 4.7,
            "reviewCount": 20,
            "isPremium": False
        }
    },
    {
        "user": {
            "email": "ahmed.ouattara@example.com",
            "password": "demo123",
            "firstName": "Ahmed",
            "lastName": "Ouattara"
        },
        "entrepreneur": {
            "profileType": "autre",
            "firstName": "Ahmed",
            "lastName": "Ouattara",
            "companyName": "Cyber Café Connect",
            "activityName": "Cyber Café & Services Numériques",
            "description": "Cyber café offrant accès internet, impression, scan et formation informatique de base. Services administratifs en ligne.",
            "tags": ["Internet", "Services", "Formation", "Impression", "Numérique"],
            "phone": "+225 05 901 2345",
            "whatsapp": "+225 05 901 2345",
            "email": "ahmed.ouattara@example.com",
            "location": "CI",
            "city": "Bouaké",
            "website": "",
            "rating": 4.3,
            "reviewCount": 8,
            "isPremium": False
        }
    }
]

async def seed_database():
    print("🌱 Starting database seeding...")
    
    # Check if data already exists
    existing_count = await db.users.count_documents({})
    if existing_count > 0:
        print(f"⚠️  Database already has {existing_count} users. Clearing...")
        await db.users.delete_many({})
        await db.entrepreneurs.delete_many({})
    
    for idx, data in enumerate(demo_data, 1):
        try:
            # Create user
            user_id = str(uuid.uuid4())
            user_doc = {
                "id": user_id,
                "email": data["user"]["email"],
                "password": pwd_context.hash(data["user"]["password"]),
                "firstName": data["user"]["firstName"],
                "lastName": data["user"]["lastName"],
                "googleId": None,
                "hasProfile": True,
                "createdAt": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
            
            # Create entrepreneur profile
            entrepreneur_doc = {
                "id": str(uuid.uuid4()),
                "userId": user_id,
                **data["entrepreneur"],
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }
            await db.entrepreneurs.insert_one(entrepreneur_doc)
            
            print(f"✅ {idx}/20 - Created: {data['user']['firstName']} {data['user']['lastName']}")
            
        except Exception as e:
            print(f"❌ Error creating profile {idx}: {str(e)}")
    
    print("\n✨ Seeding complete!")
    print(f"📊 Total users created: {await db.users.count_documents({})}")
    print(f"📊 Total entrepreneurs created: {await db.entrepreneurs.count_documents({})}")

if __name__ == "__main__":
    asyncio.run(seed_database())
