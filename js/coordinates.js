// --- js/coordinates.js ---
// Hardcoded coordinates for Louisville locations.
// The map module checks here FIRST before falling back to Nominatim geocoding.
// Format: "Business Name": [latitude, longitude]
// Last updated: April 2026 — coordinates verified via Google Places API

export const manualCoords = {

    // ===== DIVE BARS =====
    "Air Devils Inn": [38.2226, -85.6680],               	// 2802 Taylorsville Rd
    "Bambi Bar": [38.2215, -85.6818],                    	// 2701 Bardstown Rd
    "Barret Bar": [38.2360, -85.7281],                   	// 1012 Barret Ave
    "Bud's Tavern": [38.1994, -85.5890],                 	// 9119 Galene Dr
    "Canary Club": [38.2316, -85.7416],                  	// 1247 S Shelby St
    "Dive Bar": [38.2536, -85.7043],                     	// 2235 Frankfort Ave
    "Frankfort Ave Beer Depot": [38.2541, -85.6748],     	// 3204 Frankfort Ave
    "Hideaway Saloon": [38.2306, -85.7039],              	// 1607 Bardstown Rd
    "High Horse": [38.2526, -85.7375],                   	// 810 E Market St
    "Kaiju": [38.2327, -85.7371],                        	// 1004 E Oak St
    "Kern's Korner": [38.2222, -85.6835],                	// 2600 Bardstown Rd
    "Left Field Lounge": [38.2239, -85.6912],            	// 2282 Bardstown Rd
    "Mag Bar": [38.2288, -85.7582],                      	// 1398 S 2nd St
    "Mellwood Tavern": [38.2603, -85.7165],              	// 1801 Brownsboro Rd
    "Nachbar": [38.2303, -85.7355],                      	// 969 Charles St
    "Seidenfadens": [38.2392, -85.7328],                 	// 1134 E Breckinridge St
    "Shenanigans": [38.2272, -85.7083],                  	// 1611 Norris Pl
    "Spring Street Bar": [38.2514, -85.7190],            	// 300 S Spring St
    "Stooges": [38.1460, -85.7368],                      	// 7123 Grade Ln
    "The Mellwood Tavern": [38.2603, -85.7165],          	// 1801 Brownsboro Rd
    "The Merryweather": [38.2244, -85.7372],             	// 1101 Lydia St
    "The Outlook Inn": [38.2422, -85.7260],              	// 916 Baxter Ave
    "The Pearl": [38.2261, -85.7334],                    	// 1151 Goss Ave
    "Third Street Dive": [38.2513, -85.7560],            	// 442 S 3rd St
    "Whirling Tiger": [38.2568, -85.7268],               	// 1335 Story Ave

    // ===== OLDEST RESTAURANTS =====
    "Wagner's Pharmacy": [38.2045, -85.7655],            	// 3113 S 4th St
    "English Grill at the Brown Hotel": [38.2465, -85.7580], 	// 335 W Broadway
    "Mike Linnig's": [38.1191, -85.8973],                	// 9308 Cane Run Rd
    "Jack Fry's": [38.2402, -85.7238],                   	// 1007 Bardstown Rd
    "Old Louisville Tavern": [38.2248, -85.7623],        	// 1532 S 4th St
    "Checks Café": [38.2227, -85.7387],                  	// 1101 E Burnett Ave
    "Dizzy Whizz": [38.2373, -85.7576],                  	// 217 St Catherine St
    "KingFish": [38.2811, -85.6995],                     	// 3021 River Rd
    "Dairy Del": [38.2242, -85.7428],                    	// 1516 S Shelby St
    "Pat's Steakhouse": [38.2587, -85.6999],             	// 2437 Brownsboro Rd
    "Twig and Leaf": [38.2246, -85.6944],                	// 2122 Bardstown Rd
    "Ott's Tavern": [38.1881, -85.8124],                 	// 4229 Hillview Ave
    "Oriental House": [38.2508, -85.6357],               	// 4302 Shelbyville Rd
    "Ollie's Trolley": [38.2389, -85.7581],              	// 978 S 3rd St
    "Moby Dick": [38.2099, -85.7635],                    	// 2700 S 3rd St
    "The Old Spaghetti Factory": [38.2553, -85.7549],    	// 235 W Market St
    "Dairy Kastle": [38.2127, -85.7474],                 	// 575 Eastern Pkwy
    "The Bristol Bar & Grille": [38.2569, -85.7605],     	// 614 W Main St
    "Bearno's Pizza": [38.1357, -85.6847],               	// 8019 Preston Hwy
    "Hungry Pelican": [38.1662, -85.6019],               	// 5412 Bardstown Rd
    "Frank's Meat and Produce": [38.1984, -85.7324],     	// 3342 Preston Hwy
    "Impellizzeri's": [38.2337, -85.7120],               	// 1381 Bardstown Rd
    "Burger Boy Diner": [38.2265, -85.7554],             	// 1450 S Brook St
    "The Fishery": [38.2515, -85.6610],                  	// 3624 Lexington Rd
    "Lee's Korean": [38.2029, -85.6836],                 	// 1941 Bishop Ln
    "Porcini": [38.2546, -85.6925],                      	// 2730 Frankfort Ave

    // Honorable Mentions
    "The Old Talbott Tavern": [37.8091, -85.4675],       	// 107 W Stephen Foster Ave
    "Cunningham's Creekside": [38.3284, -85.6363],       	// 6301 River Rd
    "Schimpff Confectionery": [38.2726, -85.7414],       	// 347 Spring St, Jeffersonville IN
    "Heitzman Bakery": [38.2459, -85.5751],             	// 9426 Shelbyville Rd
    "Suburban Social Club Fish Fry": [38.2000, -85.7648], 	// 3901 S 3rd St
    "Muth's Candies": [38.2533, -85.7408],               	// 630 E Market St
    "Plehn's Bakery": [38.2526, -85.6535],               	// 3940 Shelbyville Rd

    // ===== OLDEST LANDMARKS =====
    "First Public Cemetery": [38.2592, -85.7669],        		// Jefferson St & 11th–12th (Baxter Square)
    "Locust Grove": [38.2875, -85.6626],                 		// 561 Blankenbaker Ln
    "Squire Earick House": [38.2693, -85.7886],          		// 719 N 34th St
    "Farmington": [38.2146, -85.6682],                   		// 3033 Bardstown Rd
    "Christ Church Cathedral": [38.2520, -85.7536],      		// 421 S 2nd St
    "Louisville and Portland Canal": [38.2612, -85.7837], 		// 810 N 27th St (McAlpine Locks)
    "Bank of Louisville": [38.2564, -85.7558],           		// 316 W Main St
    "Louisville Metro Hall": [38.2540, -85.7589],        		// 527 W Jefferson St
    "Cave Hill Cemetery": [38.2454, -85.7172],           		// 701 Baxter Ave
    "Eastern Cemetery": [38.2466, -85.7164],             		// 641 Baxter Ave
    "Cathedral of the Assumption": [38.2497, -85.7556],  		// 433 S 5th St
    "American Printing House for the Blind": [38.2575, -85.7142], 	// 1839 Frankfort Ave
    "Louisville Water Tower": [38.2806, -85.7012],       		// 3005 River Rd
    "Old Louisville Historic District": [38.2265, -85.7590], 		// 1340 S 4th St 
    "Louisville City Hall": [38.2543, -85.7631],         		// 601 W Jefferson St
    "Churchill Downs": [38.2037, -85.7724],              		// 700 Central Ave
    "Crescent Hill Reservoir": [38.2563, -85.6788],      		// Crescent Hill Reservoir
    "Simmons College of Kentucky": [38.2395, -85.7647],  		// 1018 S 7th St
    "St. James Court": [38.2293, -85.7634],              		// 1402 St James Ct
    "Louisville Slugger Museum & Factory": [38.2571, -85.7640], 	// 800 W Main St
    "Union Station": [38.2534, -85.7684],                		// 1000 W Broadway
    "Conrad-Caldwell House": [38.2293, -85.7634],        		// 1402 St James Ct
    "Big Four Bridge": [38.2658, -85.7392],              		// 1101 River Rd
    "The Big Four Bridge": [38.2658, -85.7392],          		// 1101 River Rd
    "Filson Historical Society": [38.2322, -85.7596],    		// 1310 S 3rd St
    "The Seelbach": [38.2508, -85.7578],                 		// 500 S 4th St
    "Louisville Free Public Library": [38.2439, -85.7574], 		// 301 York St
    "Vernon Lanes": [38.2574, -85.7283],                 		// 1575 Story Ave
    "Belle of Louisville": [38.2592, -85.7556],          		// 401 W River Rd
    "The Belle of Louisville": [38.2592, -85.7556],      		// 401 W River Rd
    "The Brown Hotel": [38.2465, -85.7579],              		// 335 W Broadway
    "Waverly Hills Sanatorium": [38.1302, -85.8413],     		// 4400 Paralee Dr
    "The Pendennis Clubhouse": [38.2505, -85.7550],      		// 218 W Muhammad Ali Blvd
    "The Palace Theatre": [38.2480, -85.7556],           		// 625 S 4th St
    "Louisville Memorial Auditorium": [38.2393, -85.7598], 		// 970 S 4th St

    // ===== MUSEUMS & GALLERIES =====
    "Speed Art Museum": [38.2184, -85.7609],             		// 2035 S 3rd St
    "Frazier History Museum": [38.2578, -85.7645],       		// 829 W Main St
    "Muhammad Ali Center": [38.2585, -85.7598],          		// 144 N 6th St
    "Kentucky Derby Museum": [38.2055, -85.7711],        		// 704 Central Ave
    "Roots 101 African American Museum": [38.2569, -85.7500], 		// 124 N 1st St
    "KMAC Museum": [38.2575, -85.7621],                  		// 715 W Main St
    "Kentucky Science Center": [38.2576, -85.7627],      		// 727 W Main St
    "21c Museum Hotel": [38.2568, -85.7619],             		// 700 W Main St
    "Portland Museum": [38.2695, -85.7864],              		// 2308 Portland Ave
    "Thomas Edison House": [38.2555, -85.7384],          		// 729 E Washington St
    "Mellwood Art Center": [38.2625, -85.7135],          		// 1860 Mellwood Ave
    "Revelry Boutique Gallery": [38.2530, -85.7383],     		// 742 E Market St
    "Garner Narrative": [38.2532, -85.7402],             		// 642 E Market St
    "Howard Steamboat Museum": [38.2781, -85.7256],      		// 1101 E Market St, Jeffersonville, IN 

    // ===== ATTRACTIONS & OUTINGS =====
    "Louisville Zoo": [38.2057, -85.7071],               		// 1100 Trevilian Wy
    "Waterfront Botanical Gardens": [38.2633, -85.7240], 		// 1435 Frankfort Ave
    "Louisville Mega Cavern": [38.2012, -85.7039],       		// 1841 Taylor Ave
    // TODO coords: "Vernon Lanes": [,],						// (manual lookup)
    // TODO coords: "Recbar": [,],							// (manual lookup)
    // TODO coords: "Belle of Louisville": [,],						// (manual lookup)
    // TODO coords: "Cave Hill Cemetery": [,],						// (manual lookup)
    // TODO coords: "The Big Four Bridge": [,],						// (manual lookup)

    // ===== THRIFT, VINTAGE & DIGGING =====
    "The Nitty Gritty": [38.2364, -85.7287],                   		// 996 Barret Ave
    "Fat Rabbit Thrift & Vintage": [38.2365, -85.7287],        		// 994 Barret Ave
    "Acorn Apparel":[38.2306, -85.7048],                      		// 1602 Bardstown Rd
    "Hey Tiger":[38.2310, -85.7058],                          		// 1572 Bardstown Rd
    "Barret Babes":[38.2372, -85.7291],                       		// 970 Barret Ave
    "Fleur de Flea Vintage Urban Market":[38.2396, -85.7367], 		// 947 E Breckinridge St
    "Derby City Market":[38.2371, -85.7288],            		// 978 Barret Ave ***
    "Mellwood Antiques & Interiors":[38.2628, -85.7135],      		// 1860 Mellwood Ave
    "Tickled Pink Memorabilia Mall":[38.2028, -85.7802],      		// 3269 Taylor Blvd
    "New Cut Peddler's Mall":[38.1277, -85.7772],            		// 191 Outer Loop ***
    "Outer Loop Peddler's Mall":[38.1368, -85.6543],            	// 5718 Outer Loop ***
    "Middletown Peddler's Mall":[38.2464, -85.5224],            	// 12405 Shelbyville Rd ***

    // ===== ACTIVE LOUISVILLE =====
    "Parklands of Floyds Fork":[38.2350, -85.4644],     		// Blue Heron Rd
    "Jefferson Memorial Forest":[38.0776, -85.7876],    		// 11311 Mitchell Hill Rd
    "Cherokee Park Loop":[38.2412, -85.6969],           		// 745 Cochran Hill Rd
    "David Armstrong Extreme Park":[38.2569, -85.7403], 		// 531 Franklin St
    "Climb NuLu":[38.2522, -85.7338],                   		// 1000 E Market St
    "North Beckley Paddling Access":[38.2305, -85.4679],  		// Parking lot, Louisville Loop
    "Cane Run Paddling Access":[38.1516, -85.5024],         		// Parking lot
    "Broad Run Valley Paddling Access":[38.1041, -85.5452],     	// Parking lot
    "Harrods Creek Park":[38.3396, -85.5998],                		// 6530 Montero Dr
    // TODO coords: "Louisville Hardcourt Bike Polo": [,],				// Shelby Park ***

    // ===== PARKS =====
    "Algonquin Park":[38.2278, -85.8013],                       	// 1614 Cypress St
    "Baxter Park":[38.2546, -85.7693],                        		// 301 S 12th St
    "Bingham Park":[38.2574, -85.7097],                         	// 160 Coral Ave
    "Boone Square": [38.2615, -85.7817],                         	// 1935 Rowan St
    "Central Park": [38.2297, -85.7636],                         	// 1340 S 4th St
    "Cherokee Park": [38.2421, -85.6988],                        	// 745 Cochran Hill Rd
    "Chickasaw Park":[38.2413, -85.8335],                       	// 1200 Southwestern Pkwy 
    "Elliott Park":[38.2517, -85.7986],                         	// 630 S 28th St
    "Iroquois Park":[38.1593, -85.7799],                        	// 5216 New Cut Rd
    "Seneca Park":[38.2433, -85.6700],                          	// 3151 Pee Wee Reese Rd
    "Shawnee Park": [38.2620, -85.8050],                         	// 4501 Northwestern Pkwy
    "Shelby Park": [38.2345, -85.7343],                          	// 600 E Oak St
    "Stansbury Park":[38.2160, -85.7610],                       	// 2302 S 3rd St
    "Tyler Park":[38.2365, -85.7180],                           	// 1501 Castlewood Ave
    "Victory Park":[38.2418, -85.7907],                         	// 1051 S 23rd St
    "Wayside Park":[38.2045, -85.7645],                         	// 3190 S 3rd St
    "Willow Park": [38.2350, -85.7130],                          	// 1403 Cherokee Rd
    
    "Tom Sawyer State Park": [38.2863, -85.5581],                	// 3000 Freys Hill Rd
    "Waterfront & Botanical Gardens": [38.2634, -85.7230],       	// 1435 Frankfort Ave
    "Waverly Park":[38.1306, -85.8270],                         	// 4800 Waverly Park Rd
    "Caperton Swamp":[38.2871, -85.6811],                       	// 3916 River Rd
    "Thurman-Hutchins Park":[38.2800, -85.6980],                	// 3227 River Rd
    "Bernheim Arboretum & Research Forest":[37.9068, -85.6752], 	// 2075 Clermont Rd, Clermont, KY 40110
    "Falls of the Ohio State Park":[38.2771, -85.7635],         	// 201 W Riverside Dr, Clarksville, IN 47129
    "Creasey Mahan Nature Preserve":[38.3837, -85.5991],         	// 12501 Harmony Landing Rd, Goshen, KY 40026

    // ===== BREWERIES =====
    "3rd Turn Brewing":[38.2199, -85.5688],             		// 10408 Watterson Trail
    "Against The Grain Brewery":[38.2555, -85.7433],    		// 401 E Main St
    "Akasha Brewing Company":[38.2541, -85.7386],       		// 909 E Market St
    "Atrium Brewing":[38.2346, -85.7408],               		// 1154 Logan St
    "Awry": [38.2361, -85.7288],                         		// 1025 Barret Ave
    "Bluegrass Brewing": [38.2562, -85.7551],            		// 300 W Main St
    "Butchertown Brewing": [38.2625, -85.7135],          		// 1860 Mellwood Ave #187
    "Gallant Fox":[38.2543, -85.7001],                  		// 2132 Frankfort Ave
    "Gravely Brewing": [38.2490, -85.7310],              		// 514 Baxter Ave
    "Holsopple Brewing": [38.2597, -85.6063],            		// 8023 Catherine Ln
    "Hop Atomica":[38.2312, -85.7346],                  		// 1318 McHenry St
    "Mile Wide Beer Co":[38.2427, -85.7330],            		// 636 Barret Ave
    "Monnik Beer Company":[38.2227, -85.7393],         	 		// 1036 E Burnett Ave
    "Noble Funk":[38.2407, -85.7556],                   		// 922 S 2nd St
    "Old Louisville Brewery":[38.2215, -85.7628],       		// 625 W Magnolia Ave
    "TEN20":[38.2588, -85.7351],                        		// 1020 E Washington St
    "Trellis Brewing": [38.2384, -85.7410],              		// 827 Logan St
    "West Sixth Nulu": [38.2539, -85.7395],              		// 817 E Market St Suite 101

    // ===== DISTILLERIES =====
    "Rabbit Hole Distillery": [38.2523, -85.7394],       		// 711 E Jefferson St
    "Evan Williams Bourbon Experience": [38.2568, -85.7595], 		// 528 W Main St
    "Old Forester Distillery": [38.2563, -85.7526],      		// 119 W Main St
    "Angel's Envy Distillery": [38.2550, -85.7434],      		// 500 E Main St
    "Michter's Fort Nelson Distillery": [38.2575, -85.7633], 		// 801 W Main St
    "Copper & Kings American Brandy": [38.2567, -85.7306], 		// 1121 E Washington St
    "Stitzel-Weller Distillery": [38.2090, -85.8076],    		// 3860 Fitzgerald Rd

    // ===== COFFEE =====
    "Red Hot Roasters": [38.2508, -85.7207],             	// 1399 Lexington Rd
    "Safai Coffee": [38.2301, -85.7032],                 	// 1707 Bardstown Rd
    "Sunergos Coffee": [38.2250, -85.7064],              	// 1647 Norris Pl
    "Good Folks Coffee": [38.2336, -85.7412],            	// 1151 S Shelby St
    "Fante's Coffee": [38.2444, -85.7041],               	// 2501 Grinstead Dr
    "Phalcha Coffee": [38.2540, -85.7350],               	// (manual lookup)
    "Ithmah Coffee Roasters": [38.2707, -85.7883],       	// 2425 Portland Ave
    "Bean Roastery and Cafe": [38.2560, -85.7485],       	// (manual lookup)
    "Brew & Sip": [38.2430, -85.7235],                   	// (manual lookup)
    "Hinterhof": [38.2345, -85.7367],                    	// (manual lookup)
    "Barista Parlor": [38.2555, -85.7345],               	// (manual lookup)
    "Bayt Al mocha": [38.2510, -85.7560],                	// (manual lookup)
    "Blackbeard": [38.2530, -85.7340],                   	// (manual lookup)
    "Blak Koffee": [38.2300, -85.7555],                  	// (manual lookup)
    "Butchertown Bakery": [38.2580, -85.7280],           	// (manual lookup)
    "Day's Coffee": [38.2558, -85.7350],                 	// (manual lookup)
    "Full Stop": [38.2480, -85.7240],                    	// (manual lookup)
    "Goldies": [38.2424, -85.7270],                      	// (manual lookup)
    "Haraz": [38.2555, -85.7348],                        	// (manual lookup)
    "Haymarket River Rd": [38.2680, -85.7362],           	// (manual lookup)
    "Heine Bros": [38.2150, -85.7414],                   	// 822 Eastern Pkwy
    "La Pana Bakery": [38.2470, -85.7460],               	// (manual lookup)
    "Louisville Joe Coffee": [38.2558, -85.7320],        	// (manual lookup)
    "Nook and Nowhere": [38.2540, -85.7335],             	// (manual lookup)
    "North Lime Coffee & Donuts": [38.2553, -85.7332],   	// (manual lookup)
    "Ntaba": [38.2470, -85.7270],                        	// (manual lookup)
    "Please & Thank You": [38.2530, -85.7379],           	// 800 E Market St
    "Pregame": [38.2555, -85.7342],                      	// (manual lookup)
    "Quills Coffee": [38.2544, -85.7377],                	// 802 E Main St
    "The Well": [38.2440, -85.7230],                     	// (manual lookup)
    "Whirling Tiger Coffee": [38.2568, -85.7268],        	// 1335 Story Ave
    "Witches Brew": [38.2370, -85.7355],                 	// (manual lookup)

    // ===== MUSIC VENUES =====
    "Camp Spaceman": [38.2545, -85.7340],               	// (manual lookup)
    // TODO coords: "Camp Social Club": [,],                			// (manual lookup)
    // TODO coords: "Mag Bar": [,],                				// (manual lookup)
    "Zanzabar": [38.2174, -85.7462],                    	// 2100 S Preston St
    // TODO coords: "Whirling Tiger": [,],					//
    "Portal": [38.2557, -85.7345],                      	// (manual lookup)
    "Camp Social Club": [38.2555, -85.7347],            	// (manual lookup)
    "Headliners": [38.2508, -85.7238],                  	// 1386 Lexington Rd
    "Mercury Ballroom": [38.2485, -85.7578],            	// 611 S 4th St
    "Paristown Hall": [38.2427, -85.7350],              	// 724 Brent St

    // ===== THEATRE / THE STAGE =====
    "Actors Theatre of Louisville": [38.2563, -85.7555], 	// 316 W Main St
    "The Louisville Ballet": [38.2540, -85.7420],        	// (manual lookup)
    "KY Opera": [38.2536, -85.7428],                     	// (manual lookup)
    "The Brown Theatre": [38.2543, -85.7570],            	// 315 W Broadway
    "Louisville Palace Theatre": [38.2480, -85.7556],    	// 625 S 4th St
    "KY Center for the Performing Arts": [38.2585, -85.7533], 	// 501 W Main St
    "Bunbury Theatre": [38.2605, -85.7282],              	// (manual lookup)
    "Stage One": [38.2568, -85.7560],                    	// (manual lookup)
    "Dinner Detective Murder Mystery": [38.2525, -85.7610], 	// (manual lookup)
    "Derby Dinner Playhouse": [38.2780, -85.7595],       	// (manual lookup)
    "Belknap Playhouse": [38.2150, -85.7610],            	// (manual lookup)
    "Thrust Theatre": [38.2150, -85.7590],               	// (manual lookup)
    "UL College of Art's and Sciences": [38.2150, -85.7580], 	// (manual lookup)
    "Highview Arts Center": [38.1640, -85.7230],         	// (manual lookup)
    "Louisville Comedy Club": [38.2540, -85.7465],       	// (manual lookup)
    "Comedy Caravan": [38.2440, -85.6860],               	// (manual lookup)
    "Planet of the Tapes": [38.2565, -85.7315],          	// (manual lookup)

    // ===== BIKE SHOPS =====
    "Falls City Community BikeWorks!": [38.2345, -85.7345], 	// (manual lookup)
    "CycleSmiths": [38.2100, -85.6040],                  	// (manual lookup)
    "Grit Cycling": [38.2555, -85.7345],                 	// (manual lookup)
    "Middletown Cycling": [38.2440, -85.5360],           	// (manual lookup)
    "N+1 Bikes": [38.2540, -85.7335],                    	// (manual lookup)
    "On your Left": [38.2443, -85.7268],                 	// (manual lookup)
    "Parkside Bikes": [38.2540, -85.7345],               	// (manual lookup)
    "Shifty Business Cycleworks": [38.2370, -85.7360],   	// (manual lookup)
    "Vic's Classic Bikes": [38.2170, -85.7060],          	// (manual lookup)

    // ===== BOOKSTORES =====
    "A Novel Romance": [38.2543, -85.7342],              	// (manual lookup)
    "Butcher Cabin Books": [38.2395, -85.7226],          	// (manual lookup)
    "Carmichael's Bookstore": [38.2356, -85.7154],       	// 1295 Bardstown Rd
    "Foxing Bookstore": [38.2320, -85.7365],             	// (manual lookup)
    // TODO coords: "Nook and Nowhere": [,],					// (manual lookup)
    // TODO coords: "Set & Setting": [,],					// (manual lookup)

    // ===== CINEMA & DRIVE-INS =====
    "Sauerbeck Family Drive-In": [38.4037, -85.4228],   	// 3210 D.W. Griffith Ln, La Grange KY 40031
    "Georgetown Drive-In": [38.2951, -85.9520],         	// 8200 State Rd 64, Georgetown IN 47122
    "Speed Cinema": [38.2184, -85.7609],                	// 2035 S 3rd St 
    "Preston Hwy Drive-In": [38.1420, -85.7140],        	// (manual lookup)
    "Xscape Theatres": [38.2232, -85.5932],             	// 12450 Sycamore Station Pl, Louisville KY 40299
    "Tinseltown": [38.2084, -85.6459],                  	// 4400 Towne Center Dr, Louisville KY 40241
    "AMC Stonybrook": [38.2195, -85.6051],              	// 2745 S Hurstbourne Pkwy, Louisville KY 40220
    // TODO coords: "Cinemark: Preston Crossings": [,],				// (manual lookup)

    // ===== GROCERY =====
    "Lotsa Pasta": [38.2512, -85.6533],                  	// 3717 Lexington Rd, Louisville KY 40207
    "Paul's Fruit Market": [38.2418, -85.6432],          	// 3922 Chenoweth Sq, Louisville KY 40207
    "Rainbow Blossom": [38.2196, -85.7108],              	// 3046 Bardstown Rd, Louisville KY 40205
    "Frank's Meat & Produce": [38.1984, -85.7324],       	// 3342 Preston Hwy, Louisville KY 40213
    "Garden Gate Fruit Market": [38.2600, -85.7070],     	// (manual lookup)
    "Supermercado Guanajuato": [38.1700, -85.7335],      	// 6201 Preston Hwy, Louisville KY 40219
    "Foods World": [38.1870, -85.7230],                  	// (manual lookup)
    "Five Star Halal Grocery": [38.2200, -85.7330],      	// (manual lookup)
    "Reardon's Fruit Market": [38.2090, -85.7815],       	// (manual lookup)
    "Kingsley Meats & Catering": [38.2320, -85.6440],    	// (manual lookup)
    "Red Hog": [38.2555, -85.7345],                      	// (manual lookup)
    "Lori's Fish Market": [38.2190, -85.7550],           	// (manual lookup)
    "Highland Fish Market": [38.2440, -85.7250],         	// (manual lookup)
    "Viet Hoa Food Market": [38.2400, -85.7450],         	// (manual lookup)
    "Patel Brothers": [38.2480, -85.5870],               	// (manual lookup)

    // ===== LOCAL BUSINESS =====
    "Better Days Records": [38.2417, -85.7272],          	// (manual lookup)
    "Caufield's Novelty": [38.2423, -85.7269],           	// (manual lookup)
    "Doo Wop Shop": [38.2415, -85.7260],                 	// (manual lookup)
    "Electric Ladyland": [38.2442, -85.7226],            	// (manual lookup)
    "Guestroom Records": [38.2437, -85.7259],            	// (manual lookup)
    "Home Skateshop": [38.2407, -85.7275],               	// (manual lookup)
    "Idlewild Butterfly Farm": [38.2000, -85.5400],      	// (manual lookup)
    "Keith's Hardware": [38.2365, -85.7430],             	// (manual lookup)
    "Leatherhead": [38.2560, -85.7340],                  	// (manual lookup)
    "Logan Street Market": [38.2358, -85.7394],          	// 1001 Logan St
    "Louisville Antique Market": [38.2320, -85.7650],    	// (manual lookup)
    "Louisville Nature Center": [38.2180, -85.7135],     	// (manual lookup)
    "LVL1 Hackerspace": [38.2386, -85.7450],             	// (manual lookup)
    "Mom's Music": [38.2418, -85.7263],                  	// (manual lookup)
    "Natural Mystic": [38.2430, -85.7240],               	// (manual lookup)
    "Oscars Hardware": [38.2333, -85.7356],              	// (manual lookup)
    "Preston Arts Center": [38.2425, -85.7241],          	// (manual lookup)
    "Surface Noise": [38.2325, -85.7368],                	// (manual lookup)
    "Swag's Sport Shoes": [38.2180, -85.7380],           	// (manual lookup)
    "The Great Escape": [38.2505, -85.6450],             	// (manual lookup)
    "Work the Metal": [38.2565, -85.7310],               	// (manual lookup)
    "Set & Setting": [38.2395, -85.7358],                	// (manual lookup)

    // ===== SPORTS =====
    "Louisville Bats": [38.2565, -85.7446],              		// 401 E Main St (Slugger Field)
    "Louisville Cardinals Basketball": [38.2577, -85.7536], 		// 1 Arena Plaza (KFC Yum! Center)
    "Louisville Cardinals Football": [38.2059, -85.7588], 		// 2550 S Floyd St 
    "Louisville Cardinals Hockey": [38.2244, -85.6069],  		// 1701 UPS Drive (Iceland Sports Complex)
    "Louisville City FC": [38.2593, -85.7326],           		// 350 Adams St (Lynn Family Stadium)
    "Racing Louisville FC": [38.2593, -85.7326],         		// 350 Adams St (Lynn Family Stadium)
    "Bellarmine Knights": [38.2185, -85.7055],           		// 2001 Newburg Rd (Bellarmine University)

    // ===== EDUCATION =====
    "Bellarmine University": [38.2185, -85.7055],        		// 2001 Newburg Rd
    "Galen College of Nursing": [38.2824, -85.4984],     		// 3050 Terra Crossing Blvd
    "Indiana University Southeast": [38.3440, -85.8199], 		// 4201 Grant Line Rd, New Albany IN
    "Jefferson Community & Technical College": [38.2462, -85.7530], 	// 109 E Broadway
    "Spalding University": [38.2424, -85.7581],          		// 901 S 4th St
    "Sullivan University": [38.2130, -85.6703],          		// 3101 Bardstown Rd
    "University of Louisville": [38.2158, -85.7614],     		// 2301 S 3rd St

    // ===== LATE NIGHT & 24/7 =====
    "Burger Girl Diner": [38.2539, -85.6709],            		// 3334 Frankfort Ave
    // TODO coords: "Burger Boy Diner": [,],            				// (manual lookup)
    "Spinelli's Pizzeria": [38.2456, -85.7287],          		// 614 Baxter Ave
    "Pizza Donisi": [38.2290, -85.7582],                 		// 1396 S 2nd St
    "La Bamba": [38.2367, -85.7176],                     		// 1237 Bardstown Rd
    // TODO coords: "Waffle House": [,],						// (manual lookup)

    // ===== BALL GOLF =====
    "Charlie Vettiner Park": [38.1696, -85.5669],        		// 10207 Mary Dell Ln
    "Crescent Hill Park": [38.2607, -85.6836],           		// 3110 Brownsboro Rd
    "Long Run Park": [38.2644, -85.4265],                		// 1605 Flat Rock Rd
    "Sun Valley Park": [38.1021, -85.8858],              		// 6505 Bethany Ln
    // TODO coords: Cherokee Park							// (manual lookup)
    // TODO coords: Iroquois Park							// (manual lookup)
    // TODO coords: Seneca Park								// (manual lookup)
    // TODO coords: Shawnee Park							// (manual lookup)
    // TODO coords: Waverly Park							// (manual lookup)
    
    // ===== DISC GOLF =====
    "Louisville Champions Park": [38.2678, -85.7130],    		// 2050 River Rd
    // TODO coords: Charlie Vettiner Park						// (manual lookup)
    // TODO coords: Highview Park Disc Golf Course					// (manual lookup)
    // TODO coords: Iroquois Park							// (manual lookup)

    // ===== LIBRARIES =====
    "Louisville Tool Library": [38.2323, -85.7398],      		// 1227 Logan St
    "LFPL Main Branch": [38.2439, -85.7574],             		// 301 York St
    // TODO coords: Bon Air								// (manual lookup)
    // TODO coords: Crescent Hill							// (manual lookup)
    // TODO coords: Fairdale								// (manual lookup)
    // TODO coords: Highlands-Shelby Park						// (manual lookup)
    // TODO coords: Iroquois								// (manual lookup)
    // TODO coords: Jeffersontown							// (manual lookup)
    // TODO coords: Middletown								// (manual lookup)
    // TODO coords: Newburg								// (manual lookup)
    // TODO coords: Northeast Regional							// (manual lookup)
    // TODO coords: Portland								// (manual lookup)
    // TODO coords: Shawnee								// (manual lookup)
    // TODO coords: Shively								// (manual lookup)
    // TODO coords: South Central Regional						// (manual lookup)
    // TODO coords: Southwest Regional							// (manual lookup)
    // TODO coords: St. Matthews							// (manual lookup)
    // TODO coords: Western								// (manual lookup)

    // ===== FARMERS MARKETS =====
    "Tom Sawyer Park Farmers Market": [38.2660, -85.5980], 		// 3000 Freys Hill Rd
    "Bardstown Road Farmers Market": [38.2291, -85.7024], 		// 1722 Bardstown Road
    "St. Matthews Farmers Market": [38.2519, -85.6460],  		// 4100 Shelbyville Road
    "Smoketown/Shelby Park Farmers Market": [38.2467, -85.7450],   	// 626 South Jackson St
    "West Louisville Farmers Market": [38.2427, -85.7944], 		// 946 S 25th St

    // ===== DAY TRIPS =====
    "Mammoth Cave National Park": [37.1873, -86.1007],   		// Mammoth Cave, KY 42259
    "Red River Gorge & Natural Bridge": [37.7869, -83.6763], 		// Slade, KY 40376
    "Taylorsville Lake": [38.0290, -85.2830],            		// 1320 Park Office Rd, Taylorsville KY
    "Land Between the Lakes": [36.8500, -88.1500],       		// Golden Pond, KY 42211
    "Natural Bridge State Park": [37.7791, -83.6823],    		// 2135 Natural Bridge Rd, Slade KY
    "Bernheim Arboretum & Research Forest":[37.9068, -85.6752], 	// 2075 Clermont Rd, Clermont, KY 40110
    "Falls of the Ohio State Park":[38.2771, -85.7635],         	// 201 W Riverside Dr, Clarksville, IN 47129

};
