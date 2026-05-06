import { gql } from "apollo-server-express";

const commonTypeDefs = gql`
  scalar JSON
  scalar DateTime
  scalar Upload

  directive @auth(roles: [String] = []) on FIELD_DEFINITION | OBJECT

  # ----------------- ENUMS -----------------
  enum UserRole {
    USER
    ADMIN
  }
  enum Gender {
    MALE
    FEMALE
  }
  enum AdType {
    WEB_BANNER
    IN_APP_NOTIFICATION
    EVENTS
    SPONSOR
  }
  enum AdStatus {
    AWAITING_APPROVAL
    APPROVED
    REJECTED
    PUBLISHED
    EXPIRED
  }
  enum Lg {
    I_DO_NOT_STAY_IN_OYO
    Afijio
    Akinyele
    Atiba
    Atisbo
    Egbeda
    Ibadan_North
    Ibadan_North_East
    Ibadan_North_West
    Ibadan_South_East
    Ibadan_South_West
    Ibarapa_Central
    Ibarapa_East
    Ibarapa_North
    Ido
    Irepo
    Iseyin
    Itesiwaju
    Iwajowa
    Kajola
    Lagelu
    Ogbomosho_North
    Ogbomosho_South
    Ogo_Oluwa
    Olorunsogo
    Oluyole
    Ona_Ara
    Orelope
    Ori_Ire
    Oyo_East
    Oyo_West
    Saki_East
    Saki_West
    Surulere
  }
  enum State {
    OUTSIDE_NIGERIA
    Abia
    Adamawa
    Akwa_Ibom
    Anambra
    Bauchi
    Bayelsa
    Benue
    Borno
    Cross_River
    Delta
    Ebonyi
    Edo
    Ekiti
    Enugu
    FCT
    Gombe
    Imo
    Jigawa
    Kaduna
    Kano
    Katsina
    Kebbi
    Kogi
    Kwara
    Lagos
    Nasarawa
    Niger
    Ogun
    Ondo
    Osun
    Plateau
    Rivers
    Sokoto
    Taraba
    Yobe
    Zamfara
  }
  enum City {
    Ibadan
    Ogbomosho
    Oyo
    Iseyin
    Saki
  }
  enum Town {
    Mokola
    Bodija
    Agodi
    Iwo_Road
    Dugbe
    Apata
    Sango
    UI
    Agbowo
    Samonda
    Ojoo
    Alalubosa
    Bashorun
    Felele
    Jericho
    Oluyole
    Challenge
    Olorunsogo
    Onireke
    Eleyele
    Eruwa
    Kisi
    Igboho
    Igbeti
    Awe
    Ilora
    Oja_ba
    Beere
    Foko
    Labiran
    OkeAdo
    OkeBola
    OkeOffa
    OkePadi
    Yemetu
    Akobo
    Egbeda
    Olodo
    Monatan
    Olorunda
    Orogun
    Ologuneru
    Adegbayi
    Oje
    Okeho
    Lanlate
    Lalupon
    Fiditi
    Igbo_Ora
    Idere
    Moniya
    Akanran
    Apatere
    Adeoyo
    Idi_Ayunre
    Olanla
    Olojuoro
    Osekan
    Podo
    Apete
    Ajibode
    Sepeteri
    Tede
    Iwere_Ile
    Ago_Are
    Ilero
    Akinyele
    Alakia
    Apomu
    Jobele
    Omi_Adio
    Otu
  }
  enum ContactType {
    INSTAGRAM
    FACEBOOK
    X
    TIKTOK
    WEBSITE
    WHATSAPP
    PHONE
    TELEGRAM
    EMAIL
  }
  enum TopListAd {
  BUSINESS_TOPLIST
  NOTICE_TOPLIST
  PRODUCT_TOPLIST
}
  enum BusinessCategory {
    AGRIBUSINESS
    MANUFACTURING
    RETAIL_WHOLESALE
    TECHNOLOGY
    HEALTHCARE
    EDUCATION
    TOURISM_HOSPITALITY
    REAL_ESTATE
    TRANSPORT_LOGISTICS
    FINANCIAL_SERVICES
    ENERGY
    MINING
    CREATIVE_ENTERTAINMENT
    PROFESSIONAL_SERVICES
    ENVIRONMENTAL_SERVICES
    SECURITY_SERVICES
    TELECOMMUNICATIONS
    MEDIA_PUBLISHING
    AUTOMOTIVE
    PERSONAL_SERVICES
    HOUSEHOLD_SERVICES
  }
  enum ProductCategory {
    ELECTRONICS
    FASHION
    HOME_GARDEN
    BEAUTY_HEALTH
    SPORTS_OUTDOOR
    BOOKS_MEDIA
    AUTOMOTIVE
    FOOD_BEVERAGES
    TOYS_GAMES
    ART_CRAFTS
    JEWELRY_ACCESSORIES
    PET_SUPPLIES
    OFFICE_SUPPLIES
    MUSICAL_INSTRUMENTS
    OTHER
  }
  enum DeliveryOption {
    PICKUP_ONLY
    DELIVERY_ONLY
    BOTH_OPTIONS
  }
  enum VerificationStatus {
    PENDING
    APPROVED
    REJECTED
  }
  enum PaymentStatus {
    PENDING
    PAID
    FAILED
    REFUNDED
  }
  enum PaymentPurpose {
  Top_List_Biz
  Top_List_Product
  Sponsored_Video
  Top_List_Notice
  Biz_Verification
  Sponsor
  Web_Banner
  Events
  In_app_notification
  Wallet_Funding
  Notice_Boost
}

enum OtherAds {
Sponsors
Sponsored_Video
Biz_Verification
}

enum PricingCategory {
  AD_CATEGORY
  TOP_LIST_CATEGORY
  OTHER_ADS
}
  # ----------------- INPUTS -----------------
  input PaginationInput {
    skip: Int
    take: Int
  }
  input LocationInput {
    town: Town
    city: City
    lg: Lg
  }
  input BusinessFilterInput {
    category: BusinessCategory
    city: City
    verified: Boolean
    madeInOyo: Boolean
  }
  input ProductReportInput {
    productId: ID!
    user: ID
  }

  # ----------------- RESPONSES -----------------
  type Response {
    success: Boolean!
    message: String
  }
  type BusinessResponse {
    success: Boolean!
    message: String
    data: Business
  }
  type ProductResponse {
    success: Boolean!
    message: String
    data: Product
  }
  type NoticeResponse {
    success: Boolean!
    message: String
    data: Noticeboard
  }
  type AdResponse {
    success: Boolean!
    message: String
    data: Ad
  }
  type PaymentResponse {
    success: Boolean!
    message: String
    data: Payment
  }

  type VerificationDocumentResponse {
    url: String!
    filename: String!
  }

  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
    uploadImage(file: Upload!): String!
    uploadVideo(file: Upload!): String!
    uploadVerificationDocument(file: Upload!, type: String!): VerificationDocumentResponse!
  }
`;

export default commonTypeDefs;
