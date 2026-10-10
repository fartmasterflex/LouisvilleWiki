// --- js/coordinates.js ---
// Hardcoded coordinates for map items, keyed by the exact item name in library_data.js.
// The map checks here FIRST and only falls back to a live Nominatim lookup for names not listed.
// Format: "Item Name": [latitude, longitude]   or   null = no single location (no pin, no lookup).
// Last checked: Oct 9, 2026, against OpenStreetMap and the US Census geocoder. Each comment says which.

export const manualCoords = {

    // ===== LATE NIGHT & 24/7 =====
    "Burger Boy Diner": [38.22654, -85.75514],                 // addr: 1450 S BROOK ST, LOUISVILLE, KY, 40208
    "Burger Girl Diner": [38.25386, -85.67088],                // OSM: Burger Girl Diner, 3334, Frankfort Avenue, Cherokee Garden, Metro Council District 9, Louisville, Jeffers
    "Waffle House": [38.24018, -85.72428],                     // addr: 972 BAXTER AVE, LOUISVILLE, KY, 40204
    "Spinelli's Pizzeria": [38.24570, -85.72862],              // addr: 614 BAXTER AVE, LOUISVILLE, KY, 40204
    "Pizza Donisi": [38.22896, -85.75817],                     // OSM: Pizza Donisi, South 2nd Street, Louisville, Kentucky, 40208
    "Ramen House": [38.25239, -85.71966],                      // addr: 204 S SPRING ST, LOUISVILLE, KY, 40206
    "Mag Bar": [38.22886, -85.75817],                          // OSM: Mag Bar, 1398, South 2nd Street, Louisville, Kentucky, 40208
    "The Outlook Inn": [38.24210, -85.72585],                  // addr: 916 BAXTER AVE, LOUISVILLE, KY, 40204
    "Hideaway Saloon": [38.23057, -85.70397],                  // OSM: Hideaway Saloon, Bardstown Road, Bonnycastle Neighborhood, Highlands, Louisville, Kentucky, 
    "Seidenfaden's": [38.23917, -85.73396],                    // addr: 1134 E BRECKINRIDGE ST, LOUISVILLE, KY, 40204

    // ===== MUSEUMS & GALLERIES =====
    "Speed Art Museum": [38.21785, -85.76080],                 // OSM: J B Speed Art Museum, 2035, South 3rd Street, Louisville, Kentucky, 40208
    "Frazier History Museum": [38.25785, -85.76447],           // OSM: Frazier History Museum, 827-833, West Main Street, Louisville, Kentucky, 40202, United State
    "Muhammad Ali Center": [38.25830, -85.75999],              // OSM: Muhammad Ali Center, 144, North 6th Street, Louisville, Kentucky, 40202
    "Kentucky Derby Museum": [38.20538, -85.77136],            // OSM: Kentucky Derby Museum, 704, Central Avenue, Louisville, Kentucky, 40208
    "Louisville Slugger Museum & Factory": [38.25686, -85.76371], // OSM: Louisville Slugger Museum & Factory, 800, West Main Street, Louisville, Kentucky, 40202, Uni
    "Roots 101 African American Museum": [38.25715, -85.75154], // OSM: Roots 101 African American Museum, North 1st Street, Louisville, Kentucky, 40202, United Sta
    "KMAC Museum": [38.25736, -85.76220],                      // OSM: KMAC Museum, 715, West Main Street, Louisville, Kentucky, 40202
    "Kentucky Science Center": [38.25765, -85.76256],          // OSM: Kentucky Science Center, 727, West Main Street, Louisville, Kentucky, 40202
    "21c Museum Hotel": [38.25680, -85.76186],                 // OSM: 21c Museum Hotel, 700, West Main Street, Louisville, Kentucky, 40202
    "American Printing House for the Blind": [38.25762, -85.71417], // OSM: American Printing House for the Blind, APH Wellness Team Walking Path, Clifton, Metro Council District 9,
    "Portland Museum": [38.26934, -85.78647],                  // OSM: Portland Museum, 2308, Portland Avenue, Louisville, Kentucky, 40212
    "Thomas Edison House": [38.25554, -85.73905],              // addr: 729 E WASHINGTON ST, LOUISVILLE, KY, 40202
    "Mellwood Art Center": [38.26279, -85.71321],              // OSM: Mellwood Art Center, 1860, Mellwood Avenue, Clifton, Metro Council District 9, Louisville, K
    "Revelry Boutique Gallery": [38.25307, -85.73837],         // OSM: Revelry Boutique Gallery, 742, East Market Street, Louisville, Kentucky, 40202, United State
    "Garner Narrative": [38.25325, -85.74022],                 // OSM: Garner Narrative, South Clay Street, Louisville, Kentucky, 40203
    "Howard Steamboat Museum": [38.27826, -85.72532],          // OSM: Howard Steamboat Museum, 1101, East Market Street, Port Fulton, Jeffersonville, Clark County, Indiana, 47

    // ===== ATTRACTIONS & OUTINGS =====
    "The Belle of Louisville": [38.25915, -85.75570],          // OSM: Belle of Louisville, Louisville Loop, Louisville, Kentucky, 40202
    "Louisville Zoo": [38.20499, -85.70522],                   // OSM: Louisville zoo, Taylor Avenue, Louisville-Jefferson County, Louisville, Kentucky, 40213, Uni
    "Waterfront Botanical Gardens": [38.26409, -85.72252],     // OSM: Waterfront Botanical Gardens, 1435, Clifton, Louisville, Kentucky, 40206
    "Cave Hill Cemetery": [38.24368, -85.72626],               // OSM: Cave Hill Cemetery, 701, Louisville, Kentucky, 40204
    "The Big Four Bridge": [38.26526, -85.73889],              // OSM: Big Four Bridge, Louisville, Kentucky, 40202
    "Louisville Mega Cavern": [38.20138, -85.70410],           // OSM: Louisville Mega Cavern, 1841, Taylor Avenue, Louisville-Jefferson County, Louisville, Kentuc
    "Vernon Lanes": [38.25905, -85.72234],                     // OSM: Vernon Lanes, 1575, Story Avenue, Clifton, Louisville, Kentucky, 40206
    "Recbar": [38.19584, -85.56605],                           // OSM: RecBar, Jefferson Street, Jeffersontown, Kentucky, 40299

    // ===== THRIFT, VINTAGE & DIGGING =====
    "The Nitty Gritty": [38.23654, -85.72846],                 // OSM: The Nitty Gritty, East Kentucky Street, Louisville, Kentucky, 40204
    "Fat Rabbit Thrift & Vintage": [38.23661, -85.72850],      // OSM: Fat Rabbit Thrift & Vintage, Barret Avenue, Louisville, Kentucky, 40204
    "Acorn Apparel": [38.23057, -85.70483],                    // OSM: Acorn Apparel, 1602, Bardstown Road, Bonnycastle Neighborhood, Highlands, Louisville, Kentuc
    "Hey Tiger": [38.23097, -85.70585],                        // OSM: Hey Tiger, 1572, Bardstown Road, Bonnycastle Neighborhood, Highlands, Louisville, Kentucky, 
    "Barret Babes": [38.23729, -85.72896],                     // addr: 970 BARRET AVE, LOUISVILLE, KY, 40204
    "Fleur de Flea Vintage Urban Market": [38.23974, -85.73673], // OSM: Fleur de Flea Vintage Market, Swan Street, Louisville, Kentucky, 40204
    "Derby City Antique Mall": [38.19671, -85.65558],          // addr: 3819 BARDSTOWN RD, LOUISVILLE, KY, 40218
    "Mellwood Antiques & Interiors": [38.26350, -85.71314],    // addr: 1860 MELLWOOD AVE, LOUISVILLE, KY, 40206
    "Tickled Pink Memorabilia Mall": [38.20295, -85.78035],    // addr: 3269 TAYLOR BLVD, LOUISVILLE, KY, 40215
    "Peddler's Malls": [38.13694, -85.65438],                  // OSM: Peddler's Mall Outer Loop, 5718, Outer Loop, Smyrna, Louisville, Kentucky, 40219, United Sta

    // ===== ACTIVE LOUISVILLE =====
    "The Louisville Loop": [38.27658, -85.81829],              // OSM: Louisville Loop, Portland, Louisville, Kentucky, 40212
    "The Parklands of Floyds Fork": [38.21794, -85.47543],     // OSM: Beckley Creek Park, 1411, Louisville, Kentucky, 40245
    "Jefferson Memorial Forest": [38.07717, -85.78052],        // OSM: Jefferson Memorial Forest, Louisville, Kentucky
    "Cherokee Park Loop": [38.24142, -85.69531],               // OSM: Cherokee Park Road, Louisville, Kentucky, 40206
    "David Armstrong Extreme Park": [38.25713, -85.74000],     // OSM: David Armstrong Extreme Park, 531, Louisville, Kentucky, 40202
    "Climb NuLu": [38.25216, -85.73382],                       // OSM: Climb Nulu, 1000, East Market Street, Louisville, Kentucky, 40206
    "Rocksport": [38.20918, -85.55436],                        // OSM: Rocksport, Plantside Drive, Jeffersontown, Kentucky, 40299
    "Louisville Hardcourt Bike Polo": [38.23274, -85.74570],   // OSM: Shelby Park, 600, Germantown, Louisville, Kentucky, 40203
    "Turners Circus": [38.28232, -85.69759],                   // OSM: American Turners of Louisville, 3125, River Road, Metro Council District 9, Louisville, Kent
    "Paddling Floyds Fork": [38.23050, -85.46790],             // North Beckley Paddling Access (kept)
    "Harrods Creek": [38.34229, -85.49386],                    // OSM: South Fork Harrods Creek, Park Lake, Crestwood, Oldham County, Kentucky, 40056

    // ===== CLUBS & ACTIVITIES =====
    "LXC Sports": null,                                        // leagues play all over town
    "Derby City Run Club": null,                               // meets at different breweries
    "Louisville Darts": null,                                  // leagues in bars around town
    "Louisville APA Poolplayers Association": null,            // leagues in bars around town
    "Louisville Roller Derby": null,                           // no fixed home venue confirmed
    "LVL1 Hackerspace": [38.25741, -85.72955],                 // OSM: LVL1, 1205, East Washington Street, Louisville, Kentucky, 40206
    "Falls City Community Bikeworks": [38.24392, -85.73849],   // OSM: Falls City Community BikeWorks, 716, Logan Street, Louisville, Kentucky, 40204, United State
    "Louisville Tool Library": [38.23229, -85.73979],          // OSM: Louisville Tool Library, 1227, Logan Street, Germantown, Louisville, Kentucky, 40204, United
    "Payne Street Pottery": null,                              // unverified
    "Louisville Board Gamers": null,                           // meets at libraries and game shops
    "Zanzabar Pinball League": [38.21737, -85.74613],          // OSM: Zanzabar, 2100, South Preston Street, Germantown, Louisville, Kentucky, 40217
    "Louisville Hiking Club": null,                            // hikes all over
    "Louisville Grotto": null,                                 // caving club, no clubhouse
    "Beckham Bird Club": null,                                 // field trips all over
    "Louisville Grows": null,                                  // gardens all over town
    "Derby City Swing": null,                                  // no fixed venue confirmed
    "Louisville Country Dancers": null,                        // dances at various church halls
    "Louisville Fencing Center": null,                         // no pin: location not verified yet
    "Louisville Chess Club": null,                             // no fixed venue confirmed
    "Waverly Hills Sanatorium": [38.13032, -85.84089],         // OSM: Waverly Hills Sanatorium, 4400, Paralee Drive, Waverly Hills, Louisville, Kentucky, 40272, U
    "YPAL (Young Professionals Association)": null,            // not a single place
    "Neighborhood Associations": null,                         // not a single place
    "Metro Health Harm Reduction": [38.24642, -85.74736],      // addr: 400 E GRAY ST, LOUISVILLE, KY, 40202

    // ===== OLDEST RESTAURANTS =====
    "Wagner's Pharmacy": [38.20451, -85.76531],                // OSM: Wagner's Pharmacy, 3113, South 4th Street, Louisville, Kentucky, 40214
    "English Grill at the Brown Hotel": [38.24639, -85.75797], // OSM: The Brown Hotel, 335, West Broadway, Louisville, Kentucky, 40202
    "Mike Linnig's": [38.11908, -85.89727],                    // OSM: Mike Linnig's, 9308, Cane Run Road, Greenwood, Louisville, Kentucky, 40258
    "Jack Fry's": [38.24024, -85.72373],                       // OSM: Jack Fry's Restaurant, 1007, Bardstown Road, Louisville, Kentucky, 40204
    "Checks Café": [38.22280, -85.73872],                      // OSM: Check's Cafe, 1101, East Burnett Avenue, Germantown, Louisville, Kentucky, 40217, United Sta
    "Granville Pub": [38.22445, -85.76042],                    // addr: 1601 S 3RD ST, LOUISVILLE, KY, 40208
    "Dizzy Whizz": [38.23721, -85.75756],                      // addr: 217 W SAINT CATHERINE ST, LOUISVILLE, KY, 40203
    "KingFish": [38.28113, -85.69944],                         // OSM: Kingfish Restaurant, 3021, River Road, Metro Council District 9, Louisville, Kentucky, 40207
    "Dairy Del": [38.22421, -85.74273],                        // OSM: Dairy Del, 1516, South Shelby Street, Germantown, Louisville, Kentucky, 40217
    "Pat's Steakhouse": [38.25869, -85.69992],                 // OSM: Pat's Steak House, 2437 Brownsboro Road
    "Twig and Leaf": [38.22459, -85.69440],                    // OSM: Twig and Leaf, 2122, Bardstown Road, Highlands Douglass Neighborhood, Louisville, Kentucky, 
    "Ott's Tavern": [38.18898, -85.81188],                     // addr: 4229 HILLVIEW AVE, LOUISVILLE, KY, 40216
    "Oriental House": [38.25078, -85.63567],                   // OSM: Oriental House, 4302, Shelbyville Road, St. Matthews, Kentucky, 40207
    "Ollie's Trolley": [38.23887, -85.75811],                  // OSM: Ollie's Trolley, 978, South 3rd Street, Louisville, Kentucky, 40203
    "Moby Dick": [38.20992, -85.76354],                        // OSM: Moby Dick Seafood Resturant, 2700, South 3rd Street, Louisville, Kentucky, 40208, United Sta
    "The Old Spaghetti Factory": [38.25531, -85.75487],        // OSM: The Old Spaghetti Factory, 235, West Market Street, Louisville, Kentucky, 40202, United Stat
    "Dairy Kastle": [38.21265, -85.74737],                     // OSM: Dairy Kastle, 575, Eastern Parkway, Louisville, Kentucky, 40217
    "The Bristol Bar & Grille": [38.25081, -85.57896],         // addr: 300 N HURSTBOURNE PKWY, LOUISVILLE, KY, 40222
    "Bearno's Pizza": [38.13632, -85.68549],                   // addr: 8019 PRESTON HWY, LOUISVILLE, KY, 40219
    "Kern's Korner": [38.22221, -85.68357],                    // OSM: Kern's Korner, 2600, Bardstown Road, Highlands Douglass Neighborhood, Strathmoor Gardens, Louisville, Jef
    "Hungry Pelican": [38.16629, -85.60199],                   // OSM: The Hungry Pelican, 5412, Bardstown Road, Louisville, Kentucky, 40291
    "Frank's Meat and Produce": [38.19878, -85.73241],         // addr: 3342 PRESTON HWY, LOUISVILLE, KY, 40213
    "Impellizzeri's": [38.23360, -85.71211],                   // addr: 1381 BARDSTOWN RD, LOUISVILLE, KY, 40204
    "The Fishery": [38.25144, -85.66096],                      // OSM: The Fishery, 3624, Lexington Road, Cherrywood Village, Metro Council District 9, Louisville,
    "Lee's Korean": [38.20276, -85.68302],                     // addr: 1941 BISHOP LN, LOUISVILLE, KY, 40218
    "The Old Talbott Tavern": [37.80910, -85.46750],           // 107 W Stephen Foster Ave, Bardstown (kept)
    "Cunningham's Creekside": [38.32849, -85.63635],           // OSM: Cunningham's Creekside, River Road, Gulthrie Beach, Goose Creek, Louisville, Kentucky, 40059
    "Mellwood Tavern": [38.26147, -85.71596],                  // addr: 1801 MELLWOOD AVE, LOUISVILLE, KY, 40206
    "Schimpff Confectionery": [38.27238, -85.74089],           // addr: 347 SPRING ST, JEFFERSONVILLE, IN, 47130
    "Heitzman Bakery": [38.24585, -85.57511],                  // OSM: Heitzman Traditional Bakery and Deli, 9426, Shelbyville Road, Louisville, Kentucky, 40222, U
    "Suburban Social Club Fish Fry": [38.20003, -85.76482],    // OSM: Suburban Lodge No. 740 F&AM, 3901 South 3rd Street
    "Muth's Candies": [38.25321, -85.74079],                   // OSM: Muth's Candies, East Market Street, Louisville, Kentucky, 40202
    "Plehn's Bakery": [38.25262, -85.65419],                   // addr: 3940 SHELBYVILLE RD, LOUISVILLE, KY, 40207

    // ===== OLDEST LANDMARKS =====
    "First Public Cemetery": [38.25451, -85.76956],            // OSM: Baxter Square, Louisville, Kentucky
    "Locust Grove": [38.28707, -85.66192],                     // OSM: Locust Grove Historical Home, Blankenbaker Lane, Louisville, Kentucky, 40207
    "Squire Earick House": [38.27562, -85.80277],              // addr: 719 N 34TH ST, LOUISVILLE, KY, 40212
    "Farmington": [38.21306, -85.67264],                       // addr: 3033 BARDSTOWN RD, LOUISVILLE, KY, 40205
    "Christ Church Cathedral": [38.25197, -85.75350],          // OSM: Christ Church Cathedral, 421, South 2nd Street, Louisville, Kentucky, 40202
    "Louisville and Portland Canal": [38.27827, -85.79111],    // OSM: McAlpine Locks and Dam, Louisville, Kentucky, 40212
    "Bank of Louisville": [38.25641, -85.75519],               // addr: 316 W MAIN ST, LOUISVILLE, KY, 40202
    "Louisville Metro Hall": [38.25458, -85.75944],            // OSM: Louisville Metro Hall, 527, West Jefferson Street, Louisville, Kentucky, 40202, United State
    "Eastern Cemetery": [38.24669, -85.72467],                 // OSM: Eastern Cemetery, Clifton, Metro Council District 9, Louisville, Kentucky
    "Cathedral of the Assumption": [38.25184, -85.75852],      // OSM: Cathedral of the Assumption, 443, South 5th Street, Louisville, Kentucky, 40202, United Stat
    "Louisville Water Tower": [38.28060, -85.70120],           // 3005 River Rd (kept: the address geocoder lands ~400 m off the tower)
    "Old Louisville Historic District": [38.23045, -85.76284], // OSM: Central Park, 1340, Louisville, Kentucky, 40208
    "Louisville City Hall": [38.25463, -85.76056],             // OSM: Louisville City Hall, 601, West Jefferson Street, Louisville, Kentucky, 40202
    "Churchill Downs": [38.20227, -85.77076],                  // OSM: Churchill Downs, South 3rd Street, Louisville, Kentucky, 40292
    "Crescent Hill Reservoir": [38.25767, -85.67908],          // OSM: Crescent Hill Reservoir, Metro Council District 9, Louisville, Kentucky
    "Simmons College of Kentucky": [38.23970, -85.76531],      // OSM: Simmons College of Kentucky, 1018, South 7th Street, Louisville, Kentucky, 40203, United Sta
    "St. James Court": [38.22793, -85.76313],                  // OSM: Saint James Court, Louisville, Kentucky, 40208
    "Olmsted Parks Founded": null,                             // a whole park system, not one place
    "Union Station": [38.24673, -85.76875],                    // OSM: Union Station, 1000, West Broadway, Louisville, Kentucky, 40203
    "Conrad-Caldwell House": [38.22917, -85.76369],            // OSM: Conrad-Caldwell House Museum, 1402, Saint James Court, Louisville, Kentucky, 40208, United S
    "Big Four Bridge": [38.26526, -85.73889],                  // OSM: Big Four Bridge, Louisville, Kentucky, 40202
    "Filson Historical Society": [38.23223, -85.75959],        // OSM: Filson Historical Society, 1310, South 3rd Street, Louisville, Kentucky, 40208, United State
    "The Seelbach": [38.25093, -85.75783],                     // OSM: The Seelbach Hilton Hotel, 500, South 4th Street, Louisville, Kentucky, 40202
    "Louisville Free Public Library": [38.24411, -85.75712],   // addr: 301 YORK ST, LOUISVILLE, KY, 40203
    "Belle of Louisville": [38.25915, -85.75570],              // OSM: Belle of Louisville, Louisville Loop, Louisville, Kentucky, 40202
    "The Brown Hotel": [38.24639, -85.75797],                  // OSM: The Brown Hotel, 335, West Broadway, Louisville, Kentucky, 40202
    "The Pendennis Clubhouse": [38.25075, -85.75454],          // addr: 218 W MUHAMMAD ALI BLVD, LOUISVILLE, KY, 40202
    "The Palace Theatre": [38.24805, -85.75781],               // OSM: The Louisville Palace Theater, 623, South 4th Street, Louisville, Kentucky, 40202, United St
    "Louisville Memorial Auditorium": [38.23938, -85.76012],   // OSM: Memorial Auditorium, Baseball Alley, Louisville, Kentucky, 40203

    // ===== PARKS =====
    "Algonquin Park": [38.22792, -85.80187],                   // OSM: Algonquin Park, 1614, South Parkland, Louisville, Kentucky, 40210
    "Baxter Square": [38.25451, -85.76956],                    // OSM: Baxter Square, Louisville, Kentucky
    "Bingham Park": [38.25830, -85.70987],                     // OSM: Bingham Park, Clifton, Metro Council District 9, Louisville, Kentucky
    "Boone Square": [38.26138, -85.78185],                     // OSM: Boone Square, Louisville, Kentucky
    "Central Park": [38.23045, -85.76284],                     // OSM: Central Park, 1340, Louisville, Kentucky, 40208
    "Cherokee Park": [38.23746, -85.69698],                    // OSM: Cherokee Park, Cherokee Garden, Metro Council District 9, Louisville, Kentucky, United State
    "Chickasaw Park": [38.24265, -85.83230],                   // OSM: Chickasaw Park, Shawnee, Louisville, Kentucky
    "Elliott Park": [38.25155, -85.79878],                     // OSM: Elliott Square Park, Louisville, Kentucky
    "Iroquois Park": [38.16093, -85.78696],                    // OSM: Iroquois Park, 5216, Parkwood, Louisville, Kentucky, 40214
    "Seneca Park": [38.24074, -85.67457],                      // OSM: Seneca Park, Cherokee Garden, Metro Council District 9, Louisville, Kentucky
    "Shawnee Park": [38.26533, -85.82866],                     // OSM: Shawnee Park, 4501, Portland, Louisville, Kentucky, 40211
    "Shelby Park": [38.23274, -85.74570],                      // OSM: Shelby Park, 600, Germantown, Louisville, Kentucky, 40203
    "Stansbury Park": [38.21516, -85.76296],                   // OSM: Stansbury Park, Louisville, Kentucky
    "Tyler Park": [38.23095, -85.71741],                       // OSM: Tyler Park, Highlands, Louisville, Kentucky
    "Victory Park": [38.24173, -85.79076],                     // OSM: Victory Park, 1051, Louisville, Kentucky, 40210
    "Wayside Park": [38.20133, -85.76489],                     // OSM: Wayside Park, 3190, Louisville, Kentucky, 40214
    "Willow Park": [38.23633, -85.70957],                      // OSM: Willow Park, Highlands, Louisville, Kentucky
    "Parklands of Floyds Fork": [38.21794, -85.47543],         // OSM: Beckley Creek Park, 1411, Louisville, Kentucky, 40245
    "Tom Sawyer State Park": [38.28007, -85.55713],            // OSM: E.P. "Tom" Sawyer State Park, Lakeland, Louisville, Kentucky
    "Waverly Park": [38.13082, -85.82688],                     // OSM: Waverly Park, Waverly Hills, Louisville, Kentucky
    "Caperton Swamp": [38.28863, -85.67935],                   // OSM: Caperton Swamp, Indian Hills, Kentucky
    "Thurman-Hutchins Park": [38.28334, -85.68812],            // OSM: Thurman Hutchins Park, Louisville, Kentucky
    "Bernheim Arboretum & Research Forest": [37.92434, -85.66230], // addr: 2075 CLERMONT RD, CLERMONT, KY, 40110
    "Falls of the Ohio State Park": [38.27534, -85.76288],     // OSM: Falls of the Ohio State Park, Clarksville, Clark County, Indiana
    "Creasey Mahan Nature Preserve": [38.39851, -85.57970],    // addr: 12501 HARMONY LANDING RD, GOSHEN, KY, 40026

    // ===== GROCERY =====
    "Lotsa Pasta": [38.25203, -85.66012],                      // addr: 3717 LEXINGTON RD, LOUISVILLE, KY, 40207
    "Paul's Fruit Market": [38.25515, -85.65400],              // addr: 3922 CHENOWETH SQ, LOUISVILLE, KY, 40207
    "Rainbow Blossom": [38.21339, -85.67308],                  // addr: 3046 BARDSTOWN RD, LOUISVILLE, KY, 40205
    "Frank's Meat & Produce": [38.19878, -85.73241],           // addr: 3342 PRESTON HWY, LOUISVILLE, KY, 40213
    "Supermercado Guanajuato": [38.16167, -85.69962],          // addr: 6201 PRESTON HWY, LOUISVILLE, KY, 40219
    "Five Star Halal Grocery": [38.18152, -85.76725],          // OSM: Five Star Halal Meat & Grocery Store, 310, West Woodlawn Avenue, Beechmont, Louisville, Kent
    "Kingsley Meats & Catering": [38.22324, -85.66929],        // OSM: Kingsley Meats & Catering, 2701, Taylorsville Road, Highlands Douglass Neighborhood, Strathmoor Gardens, 
    "Red Hog": [38.25423, -85.69498],                          // OSM: Red Hog, Frankfort Avenue, Metro Council District 9, Louisville, Kentucky, 40207, United Sta
    "Lori's Fish Market": [38.25541, -85.65380],               // addr: 3941 CHENOWETH SQ, LOUISVILLE, KY, 40207
    "Highland Fish Market": [38.22890, -85.70165],             // addr: 1745 BARDSTOWN RD, LOUISVILLE, KY, 40205
    "Viet Hoa Food Market": [38.14889, -85.69261],             // addr: 7100 PRESTON HWY, LOUISVILLE, KY, 40219
    "Patel Brothers": [38.22008, -85.58205],                   // addr: 1850 S HURSTBOURNE PKWY, LOUISVILLE, KY, 40220

    // ===== MUSIC VENUES =====
    "Camp Spaceman": [38.24382, -85.73403],                    // addr: 710 BARRET AVE, LOUISVILLE, KY, 40204
    "Whirling Tiger": [38.25681, -85.72685],                   // OSM: The Whirling Tiger, 1335, Story Avenue, Clifton, Louisville, Kentucky, 40206
    "Zanzabar": [38.21737, -85.74613],                         // OSM: Zanzabar, 2100, South Preston Street, Germantown, Louisville, Kentucky, 40217
    "Portal": [38.26221, -85.77434],                           // addr: 1512 PORTLAND AVE, LOUISVILLE, KY, 40203
    "Headliners": [38.25055, -85.72078],                       // addr: 1386 LEXINGTON RD, LOUISVILLE, KY, 40204
    "Mercury Ballroom": [38.24844, -85.75769],                 // OSM: The Mercury Ballroom, 611, South 4th Street, Louisville, Kentucky, 40202
    "Paristown Hall": [38.24266, -85.73498],                   // OSM: Old Foresters Paristown Hall, 724, Accessibility Ramp, Louisville, Kentucky, 40204, United S

    // ===== THEATRE / THE STAGE =====
    "Actors Theatre of Louisville": [38.25606, -85.75552],     // OSM: Actors Theatre of Louisville, 316, West Main Street, Louisville, Kentucky, 40202, United Sta
    "The Louisville Ballet": [38.25592, -85.74685],            // OSM: Louisville Ballet, East Main Street, Louisville, Kentucky, 40202
    "KY Opera": [38.24645, -85.75747],                         // performs at the Brown Theatre, 315 W Broadway
    "The Brown Theatre": [38.24645, -85.75747],                // OSM: Brown Theatre, 315, West Broadway, Louisville, Kentucky, 40202
    "Louisville Palace Theatre": [38.24805, -85.75781],        // OSM: The Louisville Palace Theater, 623, South 4th Street, Louisville, Kentucky, 40202, United St
    "KY Center for the Performing Arts": [38.25686, -85.75824], // addr: 501 W MAIN ST, LOUISVILLE, KY, 40202
    "Bunbury Theatre": [38.24860, -85.75632],                  // addr: 604 S 3RD ST, LOUISVILLE, KY, 40202
    "Stage One": [38.25686, -85.75824],                        // performs at the Kentucky Center, 501 W Main St
    "Dinner Detective Murder Mystery": null,                   // roaming dinner show
    "Derby Dinner Playhouse": [38.28063, -85.75536],           // OSM: Derby Dinner Playhouse, 525, Marriott Drive, Clarksville, Clark County, Indiana, 47129
    "Belknap Playhouse": [38.22037, -85.76114],                // addr: 1911 S 3RD ST, LOUISVILLE, KY, 40208
    "Thrust Theatre": [38.21437, -85.75578],                   // OSM: Studio Arts/HPES Building/Thrust Theater, 2314, South Floyd Street, Louisville, Kentucky, 40
    "UofL Theatre Arts": [38.21437, -85.75523],                // addr: 2314 S FLOYD ST, LOUISVILLE, KY, 40208
    "Louisville Comedy Club": [38.25282, -85.75712],           // addr: 411 S 4TH ST, LOUISVILLE, KY, 40202
    "Planet of the Tapes": [38.24613, -85.73351],              // OSM: Planet of the Tapes, 640, Barret Avenue, Louisville, Kentucky, 40204

    // ===== GOLF & DISC GOLF =====
    "Bobby Nichols (Waverly Park)": [38.12616, -85.83683],     // OSM: Bobby Nichols Golf Course, 4301, East Pages Lane, Waverly Hills, Louisville, Kentucky, 40272
    "Charlie Vettiner Park": [38.16842, -85.56794],            // addr: 10207 MARY DELL LN, LOUISVILLE, KY, 40299
    "Crescent Hill Park": [38.26132, -85.67947],               // OSM: Crescent Hill Golf Course, 3110, Brownsboro Road, Metro Council District 9, Louisville, Kent
    "Long Run Park": [38.26672, -85.41848],                    // OSM: Long Run Park, Louisville, Kentucky
    "Quail Chase": [38.10395, -85.62797],                      // OSM: Quail Chase Golf Course, Cooper Chapel Road, Louisville, Kentucky, 40229
    "Sun Valley Park": [38.10576, -85.88849],                  // OSM: Sun Valley Park, Louisville, Kentucky
    "Bullitt County Disc Golf Course": null,                   // no pin: location not verified yet
    "Highview Park Disc Golf Course": [38.13930, -85.62907],   // OSM: Highview Park, Highview, Louisville, Kentucky, 40228
    "Lapping Park": [38.33882, -85.77219],                     // OSM: Lapping Park, Blackiston Village, Clarksville, Clark County, Indiana
    "Louisville Champions Park": [38.26953, -85.70934],        // OSM: Louisville Champions Park, 2050, Clifton, Metro Council District 9, Louisville, Kentucky, 40
    "Ryan's Course at Red Orchard Park": [38.19566, -85.23411], // course coordinates (DG Course Review), Red Orchard Park, Shelbyville
    "Wendell Moore Disc Golf Course": [38.39385, -85.43677],   // OSM: Wendell Moore Park, Buckner, Oldham County, Kentucky

    // ===== DIVE BARS =====
    "Air Devils Inn": [38.22278, -85.66814],                   // addr: 2802 TAYLORSVILLE RD, LOUISVILLE, KY, 40205
    "Bambi Bar": [38.22150, -85.68180],                        // 2701 Bardstown Rd (kept: neither geocoder matched)
    "Barret Bar": [38.23612, -85.72804],                       // addr: 1012 BARRET AVE, LOUISVILLE, KY, 40204
    "Bud's Tavern": [38.19835, -85.58871],                     // addr: 9119 GALENE DR, LOUISVILLE, KY, 40299
    "Canary Club": [38.23153, -85.74171],                      // addr: 1247 S SHELBY ST, LOUISVILLE, KY, 40203
    "Dive Bar on Frankfort": [38.25367, -85.70463],            // OSM: dive bar on Frankfort, 2235, Frankfort Avenue, Clifton, Metro Council District 9, Louisville
    "Frankfort Ave Beer Depot": [38.25428, -85.67549],         // addr: 3204 FRANKFORT AVE, LOUISVILLE, KY, 40206
    "High Horse": [38.25310, -85.73778],                       // addr: 810 E MARKET ST, LOUISVILLE, KY, 40206
    "Kaiju": [38.23267, -85.73706],                            // OSM: Kaiju, 1004, East Oak Street, Germantown, Louisville, Kentucky, 40204
    "Left Field Lounge": null,                                 // unverified, could not find it
    "Nachbar": [38.23057, -85.73627],                          // addr: 969 CHARLES ST, LOUISVILLE, KY, 40204
    "Shenanigans": [38.22719, -85.70830],                      // OSM: Shenanigans Bar & Grill, 1611, Norris Place, Highlands, Louisville, Kentucky, 40205, United 
    "Spring Street Bar": [38.25149, -85.71889],                // addr: 300 S SPRING ST, LOUISVILLE, KY, 40206
    "Stooges": [38.14705, -85.73688],                          // addr: 7123 GRADE LN, LOUISVILLE, KY, 40213
    "The Merryweather": [38.22438, -85.73716],                 // OSM: The MerryWeather, 1101, Lydia Street, Germantown, Louisville, Kentucky, 40217
    "The Pearl": [38.22649, -85.73411],                        // addr: 1151 GOSS AVE, LOUISVILLE, KY, 40217
    "Third Street Dive": [38.25123, -85.75592],                // OSM: Third Street Dive, South 3rd Street, Louisville, Kentucky, 40214

    // ===== BREWERIES & DISTILLERIES =====
    "Rabbit Hole Distillery": [38.25204, -85.74002],           // addr: 711 E JEFFERSON ST, LOUISVILLE, KY, 40202
    "Evan Williams Bourbon Experience": [38.25666, -85.75948], // OSM: Evan Williams Bourbon Experience, 528, West Main Street, Louisville, Kentucky, 40202, United
    "Old Forester Distillery": [38.25658, -85.75245],          // OSM: Old Forester Distillery, 119, West Main Street, Louisville, Kentucky, 40202
    "Angel's Envy Distillery": [38.25481, -85.74373],          // OSM: Angel's Envy Distillery, South Jackson Street, Louisville, Kentucky, 40203
    "Michter's Fort Nelson Distillery": [38.25741, -85.76321], // addr: 801 W MAIN ST, LOUISVILLE, KY, 40202
    "Copper & Kings American Brandy": [38.25615, -85.73054],   // addr: 1121 E WASHINGTON ST, LOUISVILLE, KY, 40206
    "Stitzel-Weller Distillery": [38.20960, -85.80871],        // OSM: Stitzel-Weller, 3860, Fitzgerald Road, Louisville, Kentucky, 40216
    "3rd Turn Brewing": [38.19323, -85.56656],                 // OSM: 3rd Turn Brewing, 10408, Watterson Trail, Jeffersontown, Kentucky, 40299
    "Against The Grain Brewery": [38.26597, -85.77661],        // addr: 1800 NORTHWESTERN PKWY, LOUISVILLE, KY, 40203
    "Akasha Brewing Company": [38.25347, -85.73573],           // OSM: Akasha Brewing Company, 909, East Market Street, Louisville, Kentucky, 40202
    "Atrium Brewing": [38.23334, -85.74018],                   // OSM: Atrium Brewing, 1154, Logan Street, Germantown, Louisville, Kentucky, 40204
    "Awry": [38.23606, -85.72758],                             // OSM: Awry Brewing, 1025, Barret Avenue, Louisville, Kentucky, 40204
    "Butchertown Brewing": [38.26350, -85.71314],              // addr: 1860 MELLWOOD AVE, LOUISVILLE, KY, 40206
    "Gallant Fox": [38.25354, -85.70733],                      // OSM: Gallant Fox Brewing Company, 2132, Frankfort Avenue, Clifton, Metro Council District 9, Louisville, Jeffe
    "Gravely Brewing": [38.25448, -85.73544],                  // OSM: Gravely Brewing Co, 905, East Main Street, Louisville, Kentucky, 40206
    "Holsopple Brewing": [38.25937, -85.60573],                // addr: 8023 CATHERINE LN, LOUISVILLE, KY, 40222
    "Hop Atomica": [38.22854, -85.73924],                      // OSM: Hop Atomica, 1318, Mc Henry Street, Germantown, Louisville, Kentucky, 40217
    "Mile Wide Beer Co": [38.24603, -85.73293],                // OSM: Mile Wide Beer Company, 636, Barret Avenue, Louisville, Kentucky, 40204
    "Monnik Beer Company": [38.22256, -85.73938],              // OSM: Monnik Beer Company, 1036, East Burnett Avenue, Germantown, Louisville, Kentucky, 40217, Uni
    "Noble Funk": [38.24033, -85.75609],                       // addr: 922 S 2ND ST, LOUISVILLE, KY, 40203
    "Old Louisville Brewery": [38.22958, -85.76580],           // addr: 625 W MAGNOLIA AVE, LOUISVILLE, KY, 40208
    "TEN20": [38.25480, -85.73253],                            // OSM: Ten20 Brewery Butchertown, 1020, East Washington Street, Louisville, Kentucky, 40206, United
    "Trellis Brewing": [38.24078, -85.73877],                  // addr: 827 LOGAN ST, LOUISVILLE, KY, 40204
    "West Sixth Nulu": [38.25320, -85.73764],                  // addr: 817 E MARKET ST, LOUISVILLE, KY, 40206

    // ===== COFFEE =====
    "Red Hot Roasters": [38.25066, -85.72075],                 // addr: 1399 LEXINGTON RD, LOUISVILLE, KY, 40206
    "Safai Coffee": [38.23007, -85.70318],                     // OSM: Safai Coffee, 1707, Bardstown Road, Bonnycastle Neighborhood, Highlands, Louisville, Kentuck
    "Sunergos Coffee": [38.22501, -85.70642],                  // OSM: Sunergos Coffee, 1647, Norris Place, Highlands, Louisville, Kentucky, 40205
    "Good Folks Coffee": [38.23409, -85.74127],                // addr: 1151 S SHELBY ST, LOUISVILLE, KY, 40203
    "Fante's Coffee": [38.24868, -85.69574],                   // addr: 2501 GRINSTEAD DR, LOUISVILLE, KY, 40206
    "Phalcha Coffee": [38.23403, -85.73696],                   // OSM: Phalcha, Mary Street, Louisville, Kentucky, 40204
    "Bean Roastery and Cafe": [38.22587, -85.73359],           // OSM: Bean, 1138, Goss Avenue, Germantown, Louisville, Kentucky, 40217
    "Hinterhof": [38.23275, -85.73695],                        // OSM: Hinterhof Rösterie Kaffee, 1008, East Oak Street, Germantown, Louisville, Kentucky, 40204, U
    "Bayt Al Mocha": [38.23957, -85.72581],                    // addr: 1541 HIGHLAND AVE, LOUISVILLE, KY, 40204
    "Blackbeard": [38.25714, -85.76185],                       // addr: 718 W MAIN ST, LOUISVILLE, KY, 40202
    "Blak Koffee": [38.25543, -85.77103],                      // addr: 1219 W JEFFERSON ST, LOUISVILLE, KY, 40203
    "Day's Coffee": [38.23295, -85.71119],                     // addr: 1420 BARDSTOWN RD, LOUISVILLE, KY, 40204
    "Full Stop": [38.23425, -85.73226],                        // OSM: Full Stop Station, 1132, East Saint Catherine Street, Louisville, Kentucky, 40204, United St
    "Haraz": [38.24736, -85.75808],                            // addr: 655 S 4TH ST, LOUISVILLE, KY, 40202
    "Haymarket River Rd": [38.27824, -85.69652],               // OSM: Haymarket, 3020, River Road, Metro Council District 9, Louisville, Kentucky, 40207, United S
    "Heine Bros": [38.21506, -85.74145],                       // OSM: Heine Brothers' Coffee, 822, Eastern Parkway, Germantown, Louisville, Kentucky, 40217, Unite
    "La Pana Bakery": [38.23668, -85.73933],                   // addr: 991 LOGAN ST, LOUISVILLE, KY, 40204
    "Ntaba": [38.25854, -85.70189],                            // OSM: Ntaba Coffee Haus, 2407, Brownsboro Road, Metro Council District 9, Louisville, Kentucky, 40
    "Please & Thank You": [38.25298, -85.73792],               // OSM: Please & Thank You, South Shelby Street, Louisville, Kentucky, 40202
    "Quills Coffee": [38.25450, -85.73769],                    // addr: 802 E MAIN ST, LOUISVILLE, KY, 40206
    "The Well": [38.15977, -85.77834],                         // OSM: The Well Coffee Co., 5225, New Cut Road, Kenwood, Louisville, Kentucky, 40214
    "Whirling Tiger Coffee": [38.25681, -85.72685],            // OSM: The Whirling Tiger, 1335, Story Avenue, Clifton, Louisville, Kentucky, 40206
    "Witches Brew": [38.25666, -85.71606],                     // addr: 1813 FRANKFORT AVE, LOUISVILLE, KY, 40206

    // ===== SPORTS =====
    "Bellarmine Knights": [38.21637, -85.70614],               // addr: 2001 NEWBURG RD, LOUISVILLE, KY, 40205
    "Louisville Bats": [38.25645, -85.74362],                  // OSM: Louisville Slugger Field, 401, East Main Street, Louisville, Kentucky, 40202
    "Louisville Cardinals Basketball": [38.25770, -85.75386],  // OSM: KFC Yum! Center, 1, North 2nd Street, Louisville, Kentucky, 40202
    "Louisville Cardinals Football": [38.20602, -85.75877],    // OSM: L&N Federal Credit Union Stadium, South Floyd Street, Louisville, Kentucky, 40292, United St
    "Louisville Cardinals Hockey": [38.26999, -85.56729],      // OSM: Iceland Sports Complex, 1701, UPS Drive, Hurstbourne Green, Keeneland, Lyndon, Kentucky, 402
    "Louisville City FC": [38.25933, -85.73255],               // OSM: Lynn Family Stadium, 350, Adams Street, Clifton, Louisville, Kentucky, 40206
    "Racing Louisville FC": [38.25933, -85.73255],             // OSM: Lynn Family Stadium, 350, Adams Street, Clifton, Louisville, Kentucky, 40206
    "Louisville Kings (UFL)": [38.25933, -85.73255],           // OSM: Lynn Family Stadium, 350, Adams Street, Clifton, Louisville, Kentucky, 40206

    // ===== EDUCATION =====
    "Bellarmine University": [38.21875, -85.70584],            // OSM: Bellarmine University, 2001, Newburg Road, Louisville-Jefferson County, Louisville, Kentucky
    "Galen College of Nursing": [38.27533, -85.49882],         // addr: 3050 TERRA CROSSING BLVD, LOUISVILLE, KY, 40245
    "Indiana University Southeast": [38.34367, -85.81964],     // OSM: Indiana University Southeast, Countryside Drive, New Albany, Floyd County, Indiana, 47150
    "Jefferson Community & Technical College": [38.24573, -85.75287], // addr: 109 E BROADWAY, LOUISVILLE, KY, 40202
    "Purdue Polytechnic": [38.33878, -85.79875],               // OSM: Purdue University Polytechnic Institute, 3000, Technology Avenue, Purdue Research Park of Southern Indian
    "Spalding University": [38.24219, -85.75785],              // OSM: Spalding University, Library Lane, Louisville, Kentucky, 40203
    "Sullivan University": [38.21103, -85.67397],              // OSM: Sullivan University, Eleanor Avenue, Sherbrooke, Strathmoor Gardens, Louisville, Kentucky, 4
    "University of Louisville": [38.21332, -85.75771],         // OSM: University of Louisville, 2301, South 3rd Street, Louisville, Kentucky, 40292
    "Boyce College": [38.24632, -85.68598],                    // addr: 2825 LEXINGTON RD, LOUISVILLE, KY, 40206
    "Louisville Presbyterian Theological Seminary": [38.23709, -85.68496], // OSM: Louisville Presbyterian Theological Seminary, Chapel Valley Way, Cherokee Garden, Louisville
    "McKendree University": null,                              // classes are in Shepherdsville now
    "The Southern Baptist Theological Seminary": [38.24842, -85.68774], // OSM: Southern Baptist Theological Seminary, Lexington Road, Cherokee Garden, Metro Council District 9, Louisvi

    // ===== LIBRARIES =====
    "LFPL Main Branch": [38.24411, -85.75712],                 // addr: 301 YORK ST, LOUISVILLE, KY, 40203
    "Bon Air": [38.21518, -85.65519],                          // OSM: Bon Air Regional Branch Library, 2816, Del Rio Place, Bon Air Estates, Bon Air, Louisville, 
    "Crescent Hill": [38.25449, -85.69116],                    // OSM: Crescent Hill Branch Library Louisville Free Public Library, 2762, Frankfort Avenue, Metro Council Distri
    "Fairdale": [38.10622, -85.76054],                         // OSM: Fairdale Library, 10620, West Manslick Road, Fairdale, Louisville, Kentucky, 40118, United S
    "Highlands-Shelby Park": [38.23479, -85.71771],            // OSM: Mid City Mall, 1250, Bardstown Road, Highlands, Louisville, Kentucky, 40204
    "Iroquois": [38.18265, -85.77154],                         // OSM: Iroquois Branch Public Library, 601, West Woodlawn Avenue, Beechmont, Hazelwood, Louisville,
    "Jeffersontown": [38.19786, -85.56180],                    // OSM: Jeffersontown Public Library, 10631;10635, Watterson Trail, Jeffersontown, Kentucky, 40299, 
    "Middletown": [38.24634, -85.52624],                       // addr: 200 JUNEAU DR, LOUISVILLE, KY, 40243
    "Newburg": [38.18132, -85.67066],                          // OSM: Newburg Branch, 4800, Exeter Avenue, Petersburg, Louisville, Kentucky, 40218
    "Northeast Regional": [38.26843, -85.57640],               // OSM: Louisville Free Public Library - Northeast, 15, Bellevoir Circle, Hurstbourne Green, Keeneland, Louisvill
    "Shawnee": [38.24984, -85.81721],                          // OSM: Shawnee Branch, 3912, West Broadway, Shawnee, Louisville, Kentucky, 40211
    "Shively": [38.19467, -85.80642],                          // addr: 3920 DIXIE HWY, LOUISVILLE, KY, 40216
    "South Central Regional": [38.14480, -85.67566],           // OSM: South Central Regional Library, 7300, Jefferson Boulevard, Okolona, Louisville, Kentucky, 40
    "Southwest Regional": [38.11428, -85.85903],               // OSM: Southwest Regional Library, 9725, Dixie Highway, Johnsontown, Louisville, Kentucky, 40272, U
    "St. Matthews": [38.24920, -85.64956],                     // OSM: Saint Matthews Branch Public Library, 3940, Grandview Avenue, Herriston, Broad Fields, Metro Council Dist
    "Western": [38.24982, -85.76809],                          // OSM: Western Branch Library Louisville Free Public Library, 604, West Chestnut Street, Russell, Louisville, Je

    // ===== LOCAL BUSINESS =====
    "Better Days Records": [38.23956, -85.73055],              // addr: 921 BARRET AVE, LOUISVILLE, KY, 40204
    "Caufield's Novelty": [38.25768, -85.76679],               // addr: 1006 W MAIN ST, LOUISVILLE, KY, 40202
    "Doo Wop Shop": null,                                      // unverified (only one found is in Frankfort, KY)
    "Fat Rabbit Thrift": [38.23661, -85.72850],                // OSM: Fat Rabbit Thrift & Vintage, Barret Avenue, Louisville, Kentucky, 40204
    "Fleur de Flea": [38.23974, -85.73673],                    // OSM: Fleur de Flea Vintage Market, Swan Street, Louisville, Kentucky, 40204
    "Guestroom Records": [38.25657, -85.71635],                // OSM: Guestroom Records, Frankfort Avenue, Clifton, Metro Council District 9, Louisville, Kentucky
    "Home Skateshop": null,                                    // no pin: location not verified yet
    "Idlewild Butterfly Farm": [38.23516, -85.73970],          // addr: 1100 LOGAN ST, LOUISVILLE, KY, 40204
    "Keith's Hardware": [38.23739, -85.71899],                 // addr: 1201 BARDSTOWN RD, LOUISVILLE, KY, 40204
    "Leatherhead": [38.23068, -85.70414],                      // OSM: LeatherHead, 1601, Bardstown Road, Bonnycastle Neighborhood, Highlands, Louisville, Kentucky
    "Logan Street Market": [38.23566, -85.73926],              // OSM: Logan Street Market, Logan Street, Germantown, Louisville, Kentucky, 40217
    "Louisville Antique Market": [38.25175, -85.73736],        // addr: 845 E JEFFERSON ST, LOUISVILLE, KY, 40206
    "Louisville Nature Center": [38.20970, -85.71111],         // OSM: Louisville Nature Center, 3745, Illinois Avenue, Louisville-Jefferson County, Louisville, Ke
    "Mom's Music": [38.26399, -85.71205],                      // OSM: Mom's Music, 1900, Mellwood Avenue, Clifton, Metro Council District 9, Louisville, Kentucky,
    "Natural Mystic": [38.23101, -85.70494],                   // OSM: Natural Mystic, 1581, Bardstown Road, Bonnycastle Neighborhood, Highlands, Louisville, Kentu
    "Oscars Hardware": [38.25433, -85.69497],                  // addr: 2628 FRANKFORT AVE, LOUISVILLE, KY, 40206
    "Preston Arts Center": [38.26290, -85.60767],              // addr: 8101 WARWICK AVE, LOUISVILLE, KY, 40222
    "Surface Noise": [38.24603, -85.72901],                    // OSM: Surface Noise Record Store, 600, Baxter Avenue, Louisville, Kentucky, 40204
    "Swag's Sport Shoes": [38.28746, -85.57705],               // OSM: Swag's Shoes, 9407, Westport Road, Meadow Vale, Kentucky, 40241
    "The Great Escape": [38.22382, -85.68720],                 // OSM: The Great Escape Comics, 2433, Bardstown Road, Highlands Douglass Neighborhood, Strathmoor Gardens, Louis
    "Work the Metal": [38.25556, -85.72911],                   // addr: 1201B STORY AVE (Butchertown Market), LOUISVILLE, KY, 40206

    // ===== BIKE SHOPS =====
    "Falls City Community BikeWorks!": [38.24392, -85.73849],  // OSM: Falls City Community BikeWorks, 716, Logan Street, Louisville, Kentucky, 40204, United State
    "CycleSmiths": [38.25265, -85.65450],                      // addr: 3928 SHELBYVILLE RD, LOUISVILLE, KY, 40207
    "Grit Cycling": [38.21894, -85.74726],                     // addr: 2020 S PRESTON ST, LOUISVILLE, KY, 40217
    "Middletown Cycling": [38.24525, -85.54362],               // addr: 11519 SHELBYVILLE RD, LOUISVILLE, KY, 40243
    "N+1 Bikes": [38.24868, -85.53473],                        // addr: 12001 SHELBYVILLE RD, LOUISVILLE, KY, 40243
    "On Your Left Cycles": [38.24550, -85.72829],              // addr: 625 BAXTER AVE, LOUISVILLE, KY, 40204
    "Parkside Bikes": [38.23362, -85.71214],                   // addr: 1377 BARDSTOWN RD, LOUISVILLE, KY, 40204
    "Shifty Business Cycleworks": [38.23432, -85.73970],       // addr: 1125 LOGAN ST, LOUISVILLE, KY, 40204
    "Vic's Classic Bikes": [38.20333, -85.73518],              // addr: 3141 PRESTON HWY, LOUISVILLE, KY, 40213

    // ===== BOOKSTORES =====
    "A Novel Romance": [38.19465, -85.56475],                  // addr: 10512 WATTERSON TRL, JEFFERSONTOWN, KY, 40299
    "Butcher Cabin Books": [38.23681, -85.72859],              // addr: 990 BARRET AVE, LOUISVILLE, KY, 40204
    "Carmichael's Bookstore": [38.23557, -85.71548],           // OSM: Carmichael's Bookstore, 1295, Bardstown Road, Highlands, Louisville, Kentucky, 40204, United
    "Foxing Bookstore": [38.17950, -85.78375],                 // addr: 1314 BLUEGRASS AVE, LOUISVILLE, KY, 40215
    "Set & Setting": [38.26145, -85.77482],                    // addr: 1535 LYTLE ST, LOUISVILLE, KY, 40203

    // ===== CINEMA & DRIVE-INS =====
    "Sauerbeck Family Drive-In": [38.39394, -85.40928],        // OSM: Sauerbeck Family Drive In, 3210, D. W. Griffth Lane, Oldham County, Kentucky, 40032
    "Georgetown Drive-In": [38.29630, -85.96074],              // OSM: Georgetown Drive-In, 8200, Main Street, Georgetown, Floyd County, Indiana, 47122
    "Speed Cinema": [38.21788, -85.76157],                     // addr: 2035 S 3RD ST, LOUISVILLE, KY, 40208
    "Preston Hwy Drive-In": null,                              // unverified, no evidence it exists
    "Xscape Blankenbaker 14": [38.22227, -85.53155],           // OSM: Xscape Theatres Blankenbaker 16, 12450, Sycamore Station Place, Louisville, Kentucky, 40299,
    "Cinemark Tinseltown": [38.30203, -85.55784],              // OSM: Cinemark Tinseltown, 4400, Towne Center Drive, Springhurst Towne Center, Freys Hill, Louisville, Jefferso
    "Cinemark Mall St. Matthews": [38.24806, -85.62457],       // OSM: Cinemark Mall St. Matthews and XD;Cinemark St. Matthews, 5000, Shelbyville Road, Louisville,
    "Cinemark Preston Crossings": [38.10833, -85.67176],       // OSM: Cinemark Preston Crossings 16, 9700, Preston Crossing Boulevard, Louisville, Kentucky, 40229
    "AMC Stonybrook": [38.21042, -85.59635],                   // OSM: AMC Stonybrook 20 + IMAX, 2745, South Hurstbourne Parkway, Louisville, Kentucky, 40220, Unit
    "RIP Baxter Avenue Theatres (1996-2025). Forever in our Hearts.": [38.23479, -85.71771], // OSM: Mid City Mall, 1250, Bardstown Road, Highlands, Louisville, Kentucky, 40204

    // ===== DAY TRIPS =====
    "Bardstown": [37.80925, -85.46690],                        // OSM: Bardstown, Nelson County, Kentucky, 40004
    "Jim Beam American Stillhouse": [37.92882, -85.65369],     // addr: 526 HAPPY HOLLOW RD, CLERMONT, KY, 40110
    "Taylorsville Lake": [38.02952, -85.25104],                // OSM: Taylorsville Lake State Park, Spencer County, Kentucky
    "Corydon, IN": [38.21293, -86.12539],                      // OSM: Corydon, Harrison County, Indiana
    "Mammoth Cave National Park": [37.18702, -86.10128],       // OSM: Mammoth Cave National Park Visitor Center, 1, Edmonson County, Kentucky, 42259
    "Red River Gorge & Natural Bridge": [37.76820, -83.69698], // OSM: Natural Bridge State Resort Park, 2135, Powell County, Kentucky, 40376
    "Lexington, KY": [38.04641, -84.49704],                    // OSM: Lexington, Fayette County, Kentucky
    "Buffalo Trace & Woodford Reserve": [38.21574, -84.86905], // OSM: Buffalo Trace Distillery, Free House Road, Franklin County, Kentucky, 40601
    "Cincinnati, OH": [39.10128, -84.51274],                   // OSM: Cincinnati, Hamilton County, Ohio
    "Nashville, TN": [36.16228, -86.77430],                    // OSM: Nashville, Davidson County, Middle Tennessee, Tennessee
    "Land Between the Lakes": [36.74550, -88.03917],           // OSM: Land Between the Lakes National Recreation Area, Trigg County, Middle Tennessee, Kentucky, 37157, United 

    // ===== FARMERS MARKETS =====
    "Bardstown Road Farmers Market": [38.22909, -85.70218],    // addr: 1722 BARDSTOWN RD, LOUISVILLE, KY, 40205
    "Douglass Loop Farmers Market": [38.22472, -85.69380],     // addr: 2005 DOUGLASS BLVD, LOUISVILLE, KY, 40205
    "St. Matthews Farmers Market": [38.25212, -85.64645],      // addr: 4100 SHELBYVILLE RD, LOUISVILLE, KY, 40207
    "Jeffersontown Farmers Market": [38.19341, -85.56669],     // addr: 10434 WATTERSON TRL, JEFFERSONTOWN, KY, 40299
    "Old Louisville Farmers Market": [38.23045, -85.76284],    // OSM: Central Park, 1340, Louisville, Kentucky, 40208
    "South End Community & Artisan Market": [38.15996, -85.78098], // addr: 2120 RUNDILL RD, LOUISVILLE, KY, 40214
    "East End Farmers Market": [38.28782, -85.50867],          // addr: 13060 FACTORY LN, LOUISVILLE, KY, 40245
    "Phoenix Hill/NuLu Farmers Market": [38.25140, -85.73409], // addr: 1007 E JEFFERSON ST, LOUISVILLE, KY, 40206
    "Crescent Hill Community Market": [38.25284, -85.69776],   // addr: 201 S PETERSON AVE, LOUISVILLE, KY, 40206
    "Gray Street Farmers Market": [38.24791, -85.74886],       // addr: 316 E CHESTNUT ST, LOUISVILLE, KY, 40202
    "West End Farmers Market": [38.24027, -85.78190],          // OSM: California Park, 1104, Louisville, Kentucky, 40210
    "Riverside Farmers Market": [38.09666, -85.89492],         // addr: 7410 MOORMAN RD, LOUISVILLE, KY, 40272
    "Beulah Church Farmers Market": [38.14985, -85.58729],     // addr: 6704 BARDSTOWN RD, LOUISVILLE, KY, 40291

};
