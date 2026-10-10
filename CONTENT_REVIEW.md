# Louisville Wiki — Content Review

Reviewed **October 9, 2026** against [library_data.js](library_data.js) plus the hard-coded lists in `js/` (hidden gems, bingo, crawl, slot). Line numbers (`L36`) refer to `library_data.js` unless noted.

**Legend**
- ❌ **Wrong / closed.** Fix or remove.
- ⚠️ **Outdated or slightly off.** Edit.
- ❓ **Couldn't verify.** No trace online, or no news since 2023. Spot-check before keeping.
- ➕ **Gap.** Suggested addition. Each one was confirmed in 2025–2026 coverage unless marked *(verify)*.

**Status (Oct 9, later):** the ❌ and clear ⚠️ fixes below have been **applied** to `library_data.js` and the `js/` lists. ❓ items were left in place for a manual check. Follow-up checks overturned a few flags:
- Suburban Social Club Fish Fry is the real name (its site says "since 1919").
- Wheated has a Highlands location (1553 Bardstown Rd).
- Havana Rumba has a Highlands location (Harvard Dr).
- Agave & Rye is real (426 Baxter Ave, Highlands, not NuLu).
- Chicken King (639 E Broadway) and Hinterhof Rösterie (1008 E Oak St) exist.
- Martin's still has a Louisville location.

**Round 2 (Oct 9, your decisions):**
- Removed: the invented Dining block, the "might be closed" places (Bar Genevieve kept), the listed clubs, grocery stores, Camp Social Club, Highview Arts Center, five coffee shops, Indiana Wesleyan, the Portland library branch, two hidden gems, the Castleman bingo square, and four slot-machine activities.
- Kept and fixed: Baraka (now "Baraka Somali Restaurant", Oak St) and El Rey (now "El Rey Market", National Turnpike).
- Dining entries without a working website now link to their Google Maps listing (reviews + photos).

A link check also found restaurant websites taken over by spam (Momo House, Kashmir, La Suerte, Come Back Inn, Open Caribbean, Chik'n & Mi) and domains that are dead or for sale. Those `url` values are now blank, so they fall back to a search link.

---

## Top priorities (do these first)

1. **The Dining block at L277–L320 is mostly invented.** Of the 38 entries (West End, Somali, Bosnian, Hikes Point "gems"), nearly none exist under those names: no Engine House No. 5, Mama's Hip, Vito's Café West, Dreamland BBQ, Pollo Campero, Spahalic's, OK Market, Smoketown Brewery, Portland Brew, The Red Room, and so on. Several real places are also misplaced: Comfy Cow is not in Portland, and Shirley Mae's is a duplicate. Replace the block with the real spots listed under the Dining section below.
2. **Closures to remove:** La Bamba, Good Belly, Chik'n & Mi, Eatz, Ensō, Cultured, Lonnie's, Hilltop Tavern, La Chasse, Bristol (Highlands *and* downtown), Bluegrass Brewing Co. (all locations), Against the Grain taproom, Barista Parlor, North Lime, Nook & Nowhere, Comedy Caravan, and the Highlands-Shelby Park library branch (now closed for Mid City Mall demolition).
3. **The Kentucky Derby and Oaks are missing from Notable Annual Events.** It's the biggest omission on the site.
4. **The Farmers Markets section is mostly wrong.** The "Louisville Farmers Market, NuLu, Saturday" entry appears to come from *Louisville, Colorado*. Tom Sawyer Park has no market. Bardstown Road meets Saturdays at a church, not Sundays at Mid-City Mall. St. Matthews is Saturday mornings, not Thursday evenings. A verified 2026 list is in that section below.
5. **Timeline date errors:** Seelbach (1905, not 1901), Palace (1928, not 1925), Bowman Field (1919–21, not 1927), Water Tower (1860, not 1868), Lynn Family Stadium (2020, not 2021), and Kentucky School for the Blind (1842, not 1839). The 1968 riot was not "following MLK's assassination."
6. **Nothing after 2021 in the Timeline.** Add the April 2025 flood (first Thunder cancellation), the UPS Flight 2976 crash (Nov 2025, 15 dead), the Louisville Kings' title-winning first season (2026), Golden Tempo's Derby with the first female winning trainer (2026), the Mid City Mall demolition, and more.
7. **Media:** WDRB and WAVE now share one owner (Gray) and one website (wdrbwave.com, since Sept 2026). Federal CPB funding for public media ended in Jan 2026.
8. **Data hygiene:** trailing spaces break the area filter, there are duplicates, and several URLs are typos (see the next section).

---

## Data hygiene (affects filters, search, and map)

| Where | Problem | Fix |
|---|---|---|
| L136–L139 | Location is `"Highlands "` with a trailing space. These four restaurants won't match the Highlands filter. | `"Highlands"` |
| L187 | `"NuLu "` trailing space | `"NuLu"` |
| L50, L201 | Names `"Doc Crow's "` and `"The Cafe "` have trailing spaces | trim |
| L33 | `thelirishroverky.com` (typo) | probably `theirishroverky.com` *(verify)* |
| L43 | `https://bourbonsbistro.com-1` is broken. Name is "Bourbons Bistro" (no apostrophe). | `https://bourbonsbistro.com` |
| L44 | `cravecafeelouisville.com` (double "e") | *(verify domain)* |
| L71 | Bahn Thai URL is `res-pick.com`, a generic ordering site | real site or `""` |
| L195 | `burgerboyry.com` (typo) | *(verify)* |
| L233 | A Chau URL is `chaus.top`, which looks spammy | remove |
| L246 | Parkway Diner URL is bare `toasttab.com` | real link or `""` |
| L252 | `mairamediteranean.com` (misspelled) | *(verify)* |
| L728 / L734 | "Mellwood Tavern" **and** "The Mellwood Tavern" both in Dive Bars | keep one |
| L785 / L801 | "Good Folks Coffee" listed twice in Coffee | keep one |
| L221 / L283 | Shirley Mae's listed twice; the "(West)" copy is invented | delete L283 |
| L292 / L334 | Hilltop Tavern in two sections (and it's closed) | remove both |
| Name drift | "Fleur de Flea" (L395) vs "Flea de Fleur" (L910); "Porcini's" (L78) vs "Porcini" (L502); "Checks Café" vs "Check's Cafe"; "Seidenfadens" vs "Seidenfaden's"; "Buds Tavern" vs "Bud's Tavern"; "Spinellis" vs "Spinelli's Pizzeria" | pick one spelling each, which also helps the map coordinate lookup |
| L470 | Leftover comment `// The rest of the original lists ... remain here.` | delete |
| `js/coordinates.js` | ✅ **Rebuilt Oct 9.** Every map item was geocoded against OpenStreetMap and the US Census address geocoder; the two were reconciled, and disagreements were checked by hand. That gives 361 pins with the source in each comment, plus 41 `null` entries ("no pin") for clubs and other things that aren't single places, or whose location isn't verified. `map.js` now honors `null`, so those don't trigger a random live lookup. The old guesses were off by up to ~18 km (Idlewild, N+1 Bikes, Preston Arts Center, The Well). | done |

---

## 🍽️ Dining Directory (L7–L320)

### ❌ Closed or gone

| Line | Entry | Status |
|---|---|---|
| L27 | Cultured | Closed Mar 7, 2026 (1007 E Main) |
| L36 | Chik'n & Mi | Closed Feb 28, 2026. Adelita Mexican is moving into the space. |
| L37 | Eatz Vietnamese | Closed end of Sept 2026 (2244 Frankfort Ave) |
| L40 | Enso | Closed Aug 2025. The space is now **Mill Iron 4** (MeeshMeesh + North of Bourbon team, 1758 Frankfort Ave, opened Feb 2026). Swap it in. |
| L96 | La Bamba | Permanently closed in 2026, and the 1237 Bardstown Rd property was sold |
| L126 | Good Belly | Closed end of Aug 2026. It was at 2216 Dundee Rd (Belknap), not the Highlands. |
| L132 | La Chasse | Shut abruptly July 2025. The owners said it would "pass to new owners"; I found no reopening. |
| L136 | Bristol Bar & Grille (Highlands) | Original 1977 Highlands location closed Mar 15, 2026; downtown closed May 24, 2026. **Only Hurstbourne remains.** Change location to East End. |
| L251 | Lonnie's Best Taste of Chicago | Closed Oct 2025 (owner retired) |
| L292 | Hilltop Tavern | Closed Sept 2025. 1800 Frankfort Ave is now **Clifton Tavern** (opened Mar 2026). |
| L48 | Bandido Taqueria | Listed as permanently closed on a closures directory *(verify)* |
| L270 | Barry's Cheesesteaks | The original Valley Station shop closed Nov 22, 2025. Check whether any other location remains. |

### ⚠️ Changed, wrong location, or wrong details

| Line | Entry | Issue → fix |
|---|---|---|
| L21 | Eden & Kissi | Moved Apr 1, 2026 to **6006 Shepherdsville Rd**, so it's no longer Buechel |
| L24 | Butchertown Bakery | Real name is **Butchertown Grocery Bakery**, 743 E Main (NuLu edge). The parent restaurant closed, and a 2026 listing shows the bakery closed too *(verify; also in Coffee L797)* |
| L16 | Pat's Steakhouse | 2437 Brownsboro Rd is Clifton/Brownsboro, not East End |
| L120 | Superchefs | Highlands location (1702 Bardstown) closed in 2022. Find the current location or drop it. |
| L121 | Bunz Burgerz | It's inside the **Village Market Food Hall in Paristown**, not the Highlands |
| L127 | Palermo's | The only Palermo's Italian I found is in **La Grange**. Replace with **Cipollini** (1606 Bardstown Rd, the old LouVino space, opened Mar 2026). |
| L129 | Wheated | 2829 S 4th St (Beechmont/South End), not the Highlands *(verify)* |
| L138 | Havana Rumba | Locations are St. Matthews and Middletown; no Highlands location found *(verify)* |
| L168 | I Love Tacos | Five of seven locations rebranded **Tacos D'Amor & More** in Apr 2025 |
| L169 | Mark's Feed Store | Deer Park location closed Aug 2025; the others are fine |
| L171 | Martin's BBQ | Barret Ave closed in 2021. Only Indian Lake Dr was left; confirm it's open. |
| L172 | Taco Luchador | Down to St. Matthews and J-town per older coverage *(verify)* |
| L184 | Mashup Food Hall | Real; opened Nov 2025 at 750 E Jefferson ("PhoenixLu"). Add a URL. Vendors include Cold Smoke Bagels, Wiltshire Pantry, and Ramiro's Cantina. |
| L187 | Agave & Rye | No Louisville location found (it's a Lexington/N. KY chain) ❓ |
| L188 | Bar Genevieve | Hotel Genevieve changed: Byrdie's closed Feb 2026, and **The Exchange** opened Aug 2026. Confirm the rooftop bar is still Bar Genevieve. |
| L201 | The Cafe | It's in **Paristown** (711 Brent St), not the Highlands |
| L205 | Louie's Hot Chicken | Reopened Sept 2025 after a remodel with a soups-and-sandwiches menu, so the dish may be outdated (4222 Poplar Level Rd, Camp Taylor) |
| L207 | The Table (Portland) | A delivery directory showed it closed in July 2026 *(verify)* |
| L221 | Shirley Mae's | 802 S Clay St is **Smoketown**, not Shelby Park |
| L224 | Shahar Cafe | Was at 1511 Bardstown Rd, which is now koko + rae (L8). Find the current location. |
| L227 | Daddy Vic's | Reopened Feb 2026 in **Shively** |
| L228 | "Suburban Social Club Fish Fry" | Usually called **Suburban Fish Fry** (Masonic Suburban Lodge); seasonal from early March, Saturdays. The 1919 date is unverified. |
| L287 | Comfy Cow | Not in Portland. The Frankfort Ave shop closed; current shops are **Middletown and Westport Village**. Move it. |
| L30 | Wagner's Pharmacy | Open ✓. "Derby Pie" is a trademark of Kern's Kitchen, so check what Wagner's actually calls theirs. |
| L62 | Wild Swann | ✓ Speakeasy in the basement of The Grady Hotel (601 W Main) |
| L67 | Cask Southern Kitchen | ✓ 9980 Linn Station Rd (Plainview) |
| L56 | Vincenzo's | Open ✓. Its building is part of the Humana-block redevelopment talks, so watch it. |
| L10 | Bon Air Tavern ("Kozy Burger") | ❓ No trace found |
| L45 | Chicken King | ❓ No trace found |

Verified as fine: koko + rae (1511 Bardstown, Jamaican), Bellissimo (2217 Steier Ln), Decade (1076 E Washington), YachtSea (opened June 2025), Porch (Marriott), Yi Sushi Omakase, The Black Italian (2009 Highland Ave), Anko Sushi (StrEatery, Beechmont), Franny's (opened Dec 2025, 998 Goss), Parkway Diner (former Cottage Inn, 570 Eastern Pkwy), Burger Girl (3334 Frankfort), Shawarma Shack (opened Nov 2025, St. Matthews), Bourbon & Burgers (Olé's, St. Matthews), Pasta Garage (552 E Market), Emmy Squared (825 E Market), Bar Vetti (AC Hotel), Lou Lou on Market (812 E Market), Malone's (Paddock Shops), Recbar (J-town), Ollie's Trolley (978 S 3rd, weekday lunch), Pizza Donisi, Abyssinia (554 S 5th), 610 Magnolia (Wed–Sat), Blue Dog, Red Hog, Bourbons Bistro (20 years in 2025), Martini, Maya Bagel Express (expanding to Parkway Village), Heart & Soy/Roots, North of Bourbon.

**Not individually checked** (spot-check when you have time): Kingsley, Momo House, Shady Lane, Mesh, Take Thai, Tandoori Fusion, Bahn Thai, Jays Burgers, M. Peppers (now a French bistro at the Bellwether Hotel, so the "Au Poivre Burger" fits), Kebab House, Banh Mi & Pho Lounge, Charcoal, Payne Street Bakehouse, Passtime, The Goose, VinBun, Highland Fish Market, Clay Oven, Sam's Gyros, Kum's Cafe, Open Caribbean, Veronica's, La Tropicana, La Rosita, Panchitos, Tacolandia, Mirage, Toastys, Perso, Christi's, La Chiquita, La Torta Loca, Kathmandu Kitchen, Sam's Chicago Grill, Weekend Burger, Tuscany, El Molcajete, Jamaican Jerk Center, Ricky B's, Lori's Fish Market, Silvio's, Mojito in Havana, District 6, Lucretia's (Yelp lists it in Limerick), La Rosita Sol, Osteria.

### ❌ The L277–L320 block

| Lines | Verdict |
|---|---|
| L278 Dreamland BBQ | Alabama/Georgia/Florida chain; no Kentucky location |
| L279 Jerry's Restaurant | The last Louisville Jerry's (Dixie Hwy) closed in 2020 and wasn't in the West End |
| L280 Engine House No. 5 | No trace (the firehouse BBQ is **FDKY BBQ**, 9606 Taylorsville Rd) |
| L281 Mama's Hip | No restaurant. Mama's Hip is a family-support co-op. |
| L282 Vito's Café West | No trace (Vito's Café is in Fort Thomas, KY) |
| L283 Shirley Mae's (West) | Duplicate |
| L286 Portland Brew | No trace (Portland Brew is in Nashville) |
| L287 Comfy Cow (Portland) | Wrong neighborhood (see above) |
| L288 Bon Appetit Catering Cafe | ❓ no trace |
| L291 The Red Room (Paristown) | ❓ no trace |
| L292 Hilltop Tavern | Closed |
| L293 Smoketown Brewery | Doesn't exist. The Smoketown brewery is **Trellis Brewing** (801 Logan St, with Ferncliff Distillery planned next door). |
| L296–L300 Somali/Eritrean block | Only **Baraka** exists, and it's on **Oak Street**, not Breckinridge Ln. Ifrah, Afrik, Shira Cafe, and Alla Berbera: no trace. |
| L303–L305 Bosnian block | Spahalic's, OK Market, Euro Market: no trace |
| L308–L320 Hikes Point/Poplar Level | Tan A, Pho Binh, Golden Wok, Himalayan Kitchen, Taste of Himalaya, Little India Grocery, Lalibela, Baburchi, Mexico Lindo, El Rey, **Pollo Campero (no Kentucky location)**, Salvadoran Bakery Rosy, Mercado La Flor: no trace |

### ➕ Real replacements for that block (all confirmed open or opened 2025–26)

- **West End / Russell / Shawnee:** Sweet Peaches (1800 W Muhammad Ali Blvd, soul food), Gigi's Kitchen (soul food, Russell, opened Apr 2026), Orleans Authentic Cajun (Russell), Soulful Choices (Shawnee), West End BBQ Pit and Granny's Kitchen (W Broadway, Shawnee), Xhale (1670 S 17th St, ribbon cutting Aug 2026), Acai-Ville Cafe (Russell), Indi's (already listed)
- **Somali / East African:** Baraka (Oak St), Imanka (International Mall), Mimi's Ethiopian (Deer Park, Aug 2026), Unice's Kitchen (Liberian, West Buechel)
- **Bosnian / Balkan:** Borsalino Cafe & Deli (burek, ćevapi), Jasmin Bakery (already L18)
- **Nepali / South Asian:** Himalayan Restaurant (1578 Bardstown Rd), Mount Everest View (Buechel), TOGO India, Turmeric Indian Bistro (Buechel, Jan 2026), Zila Indian Kitchen (St. Matthews, Apr 2026), Hurry for Curry (Deer Park)
- **Latin American:** Trujillo (Honduran, Okolona), Perú Peruvian (Middletown), La Guanaquita 2 (Salvadoran, Smoketown), Sweet Colada (Cuban café, 1113 Logan), Lucia's Cafecito y Más (Cherokee Triangle)
- **New and notable (2025–26):** Serai (Sebastian Moh, Clifton), Mill Iron 4 (Clifton), Cipollini (Highlands), Prado 264 (Italian-Cuban, Deer Park), OMA (Chef Burress, 1116 Logan St), Gladwell Dinette (Shelby Park), Jaymar Japanese Grill (Schnitzelburg), HaiFry (Osaka-style, Tyler Park), Murray's Creole Pub (Deer Park), Mixmix Cafe (Filipino, Highlands-Douglass), Pide Point (Turkish, Fern Creek), Classico Pizzeria (Main St across from Slugger Field), Secret Recipe bakery (438 W Market), Beechmont Bakeshop

---

## 🌙 Late Night & 24/7 (L327–L341)

- ❌ **Hilltop Tavern** (L334) closed. For late-night Clifton, use **Dive Bar on Frankfort** (opened 2025 in the old Hub space) or **Clifton Tavern**.
- ❌ **Expo** (L335) was an unmarked **craft-cocktail bar** at 114 W Main, not a "neon-drenched dive with smashburgers," and it **closed in September 2024** (rent increase, per LEO). Removed.
- ⚠️ **Ramen House** (L336) is in **Irish Hill** (reopened Sept 2025), not the Highlands. Its late hours are unverified.
- ⚠️ **Spinelli's** (L332): locations are Highlands (614 Baxter), St. Matthews (4001 Shelbyville Rd), and downtown (574 S 4th). Late hours vary by location, so "until 5 AM" isn't reliable. "Slices out of cars" reads like a typo.
- ✓ Burger Boy and Burger Girl (24/7), Pizza Donisi (next door to Mag Bar), Hideaway Saloon (4 PM–4 AM).
- ➕ Add **Third Street Dive**, **Nachbar**, and **Merle's** (open until midnight Fri–Sat). Context worth a line: in July 2026 a Highlands petition to make three Bardstown Rd precincts "moist" (food-only alcohol) was dropped after the city made its late-night safety task force permanent.

---

## 🖼️ Museums & Galleries (L348–L365)

- ⚠️ **Speed Art Museum** (L349): **free Sundays ended in 2026**. Sundays are now **pay-what-you-want** (confirmed by you; early reports said once a month). Free **First Thursdays** (5–8 PM) are also listed. The new **Cressman Art Park** opened in 2025, and the in-house Est. 1927 café closed May 2026.
- ⚠️ **American Printing House for the Blind** (L359, L462): the new **Dot Experience** museum (28,000 sq ft, Helen Keller archives, factory tour) opens **Oct 30, 2026**. Update both entries.
- ✓ **Roots 101** is at 124 N 1st St; the city budgeted $1M in 2026 to make it permanent.
- ❓ **Garner Narrative** (L364): no recent activity found.
- ✓ Thomas Edison House is in **Butchertown**, so say where it is.
- ➕ **SAR Education Center & Museum** (809 W Main, on Museum Row; partial opening July 2026, full 2027), **AHOY Children's Museum** (West End, first phase late 2026), **Louisville Water Tower / WaterWorks Museum**, **Conrad-Caldwell House**, **Filson Historical Society**, **Locust Grove**, **Farmington**, **Riverside, the Farnsley-Moremen Landing**, **Louisville Stoneware** (Paristown, studio tours), and the **Kentucky Derby Museum's** remastered *The Greatest Race* (2025).

## 🎡 Attractions & Outings (L372–L381)

- ⚠️ **Louisville Zoo**: **134 acres** (not 130). It set an attendance record in FY2026 (945,225), and the $100M **Kentucky Trails** exhibit (bison, elk, black bear) breaks ground in 2027.
- ⚠️ **Mega Cavern**: the **underground bike park closed** and isn't coming back. Ziplines, Mega Quest ropes course, tram tours, and Lights Under Louisville remain.
- ⚠️ **Belle of Louisville**: her 2025 season was cut short by flooding and repairs (she missed the 2025 Steamboat Race). She returned in 2026 and **won** the race against the Belle of Cincinnati on a judges' ruling.
- ⚠️ **Vernon Lanes** (L380, also L546): the building dates to the 1870s/1880s, bowling there started around 1918, and it reopened in 2022. The "1910" in Landmarks is shaky.
- ⚠️ **Recbar** (L381) is in Jeffersontown (10301 Taylorsville Rd) with 130+ games.
- ✓ Cave Hill: also mention George Rogers Clark.
- ➕ **Churchill Downs** (live racing, plus the $90M grandstand renovation for Derby 150), **Kentucky Kingdom** (Flying Fox coaster), **Waterfront Park + PlayPort** (the West End expansion's first piece opened Mar 2025), **Topgolf** (Oxmoor), **GoodBounce Pickleball Yard** (1515 Rivershore Dr), **Iroquois Amphitheater**, **Whiskey Row**, and **Louisville Slugger Field**.

## 🧥 Thrift, Vintage & Digging (L388–L399)

- ✓ Nitty Gritty (996 Barret), Fat Rabbit (994 Barret), and Fleur de Flea (947 E Breckinridge in Paristown, ~35,000 sq ft, with an in-house bar and holiday outdoor markets at Waterfront Festival Plaza).
- ⚠️ **Hey Tiger** (L392): the only listing I found calls it a small vintage/handmade gift shop at 1572 Bardstown Rd. Thin evidence.
- ❓ **Acorn Apparel** (latest info 2019), **Barret Babes** (last seen 2024), **Tickled Pink Memorabilia Mall**.
- ❓ **"Mellwood Antiques & Interiors"** (L397): possibly a mix-up with **Crazy Daisy Antique Mall** (1430 Mellwood Ave, 120+ stalls).
- ➕ **Sugar Town Vintage** (NuLu), **Bermuda Highway** (E Market; Houndmouth's Katie Toupin; concert tees and records), **Nearly New Shop**, **Louisville Antique Market** (845 E Jefferson), and the record stores (see Local Business).

## 🚴 Active Louisville (L406–L419)

- ❌ **David Armstrong Extreme Park** (L412) is **not open 24/7**. Since 2023 it's 6 AM–11 PM. The 24-ft full pipe is correct.
- ⚠️ **Louisville Loop** (L407): about **50 of ~100–110 miles** are built. Saying so is more informative than "will eventually."
- ⚠️ **Rocksport** (L414) closed Feb 2026 and **reopened Mar 14, 2026** under six climber-owners. It's still the only roped gym in town.
- ❓ **Climb NuLu** (L413): no news since 2023 *(verify)*.
- ❓ **Louisville Hardcourt Bike Polo** (L415/L428): no recent activity found.
- ✓ **Blue Moon Canoe & Kayak** (Floyds Fork) and **Nachand Canoe & Kayak** (Harrods Creek) both exist.
- ➕ **Goodbounce pickleball**, **Louisville Race Club** (meets at Gravely Brewing), **Fleet Feet social runs**, **Beckley Creek Park**, **Champions Park**, and the **Big Four Bridge**.

## 🎳 Clubs & Activities (L426–L467)

| Entry | Finding |
|---|---|
| LXC Sports | ✓ Real (812 Lyndon Ln). Kickball, sand volleyball, bowling. |
| Derby City Roller Girls (L433) | ⚠️ Now **Louisville Roller Derby** (celebrated its 20th season in 2025) |
| Derby City Run Club (L429) | ✓ Exists. Also add **Louisville Race Club** (Gravely), **She Runs This Town**, **Iroquois Hill Runners**. |
| Falls City Community Bikeworks | ✓ Shelby Park, Logan St. Lost about $19K in a Christmas 2024 theft. |
| Louisville Tool Library | ✓ Active (Logan St, Shelby Park; LPM profile May 2026) |
| Louisville Fencing Club (L455) | ⚠️ Real name is **Louisville Fencing Center** |
| Fearless Comedy / Improv (L453) | ❓ Not found. **Louisville Improvisors** is the established troupe. |
| Buechel Park Boxing, Gut Check Boxing (L457–458) | ❓ Neither found. Real options: **Louisville TKO Boxing** (104 E Breckinridge, youth nonprofit) and **Columbia Gym** (where Ali learned to box, now Spalding's). Also, Buechel isn't the South End. |
| Silent Reading Party, Payne Street Pottery, SAK Softball, Louisville Darts, Derby City Swing, Bridge (LBA) | ❓ Couldn't confirm. Spot-check. |
| Rotary "one of the largest in the world" | ❓ Soften the claim |
| KY Harm Reduction Coalition (L467) | ⚠️ The URL points to the **Metro Health** harm-reduction page, not the Kentucky Harm Reduction Coalition. Rename the entry or change the link. |
| Waverly Hills (L460) | ✓ Tours and overnights still run through the Historical Society. The hotel plan is stalled on financing. |

## 🥘 Oldest Restaurants (L475–L512)

| Line | Entry | Fix |
|---|---|---|
| L478 | Jack Fry's note "Closed 1972–1981" | ❌ Jack Fry closed it in 1972, the space ran as *Por Que No*, and Susan Seiller revived the Jack Fry's name in **January 1987** |
| L479 | Old Louisville Tavern **1933** | ❌ The current business opened in **2013** (Dan Borsch). Remove it, or note it only if the bar space itself dates to 1933 *(verify)*. |
| L502 | Porcini **1980** | ❌ Opened **1992** (per the restaurant) |
| L493 | Bristol **1977** | ⚠️ The original 1977 location closed Mar 2026; the brand lives on at Hurstbourne |
| L499 | Burger Boy **1980** | ⚠️ Juanita took over in 1980; the corner has been a diner since the 1960s |
| L480 | Check's **1935** | ✓ (chili on the menu since 1944) |
| L507 | Mellwood Tavern **1885** | ✓ Building and tavern date to 1885. "Longest continually running in the state" is self-described, so soften it. |
| L510 | Suburban Social Club **1919** | ❓ Name is likely "Suburban Fish Fry"; the year is unverified |
| L511 | Muth's **1920** | ⚠️ Muth's itself says **1921** *(verify)* |

✓ Verified: Wagner's 1922, Brown Hotel 1923, Mike Linnig's 1925, Dairy Del 1951, Pat's 1958, Twig and Leaf 1962, Oriental House 1964, Ollie's 1973, Lee's Korean 1980 (said to be the city's first Korean restaurant).

➕ Bars with documented dates that also fit here (GoToLouisville): **Seidenfaden's 1921**, **Air Devils Inn 1934**, **Outlook Inn 1974**. An "RIP" footnote could cover **Cottage Inn** (1929–2025, now Parkway Diner) and **Cheddar Box St. Matthews** (closed 2024 after 47 years).

## 🏛️ Oldest Landmarks (L519–L552)

| Line | Entry | Issue |
|---|---|---|
| L519 | First Public Cemetery 1786 | ✓ Add that it's now **Baxter Square** (an Olmsted park), which nicely ties to the Parks list |
| L528 | Eastern Cemetery 1848 | ⚠️ Most sources say 1844 *(verify)* |
| L529 | Cathedral of the Assumption "3rd oldest Catholic cathedral" | ❓ Unsourced; soften to "one of the oldest in continuous use" |
| L532 | Old Louisville 1860 | ⚠️ Built mainly 1870s–1900s (your Neighborhoods text says 1880–1910) |
| L535 | Crescent Hill Reservoir **1877** | ❌ **1879** (your Neighborhoods entry already says 1879) |
| L537 | St. James Court **1880** | ⚠️ Laid out in the 1890s after the Southern Exposition; your Timeline says 1895 |
| L538 | Louisville Slugger Museum 1884 | ⚠️ The first bat is 1884; the museum and factory on Main opened in 1996 |
| L543 | Filson 1905 | ⚠️ The Society was founded in **1884**; the Ferguson Mansion is 1905 |
| L546 | Vernon Lanes 1910 | ⚠️ See Attractions |
| L531 / L1056 | Water Tower | ✓ 1860 here, but the Timeline says 1868. Fix the Timeline. |

➕ **Oxmoor Farm** (1791), **Riverside Farnsley-Moremen** (1837), **Zachary Taylor's Springfield** (c. 1790) and the **Zachary Taylor National Cemetery**, **Brennan House** (1868), **Thomas Edison House**, **Western Branch Library** (1908; the first library in the country run by and for Black patrons), and **Columbia Gym**.

## 🌳 Parks (L559–L588)

- ⚠️ **Iroquois Park** (L568): "Highest point in Louisville" isn't accurate; the county's high ground is in the knobs around Jefferson Memorial Forest. Say "best overlook in the city" instead.
- ⚠️ **Shawnee Park** (L570): it's known for the **Dirt Bowl** and the Great Lawn on the river. The "historic amphitheater" is Iroquois's. *(verify)*
- ❌ **Tom Sawyer State Park** (L580): there's no farmers market there, and the pool isn't in current amenity listings.
- ⚠️ "Waterfront **&** Botanical Gardens" (L581) should be **Waterfront Botanical Gardens**.
- ❌ **Caperton Swamp** (L584) is on **River Road**, not in the Highlands.
- ❌ **Bernheim** (L586 and L982): the giants are **Mama Loumari, Little Nis, and Little Elina** (Thomas Dambo). There's no "Ent." It's about 30–35 minutes away, not 45.
- ⚠️ **Creasey Mahan** (L588) is in **Goshen (Oldham County)**, about 170 acres, so not "East End."
- ✓ The Olmsted list matches the Olmsted Society's roster (Churchill Park no longer exists). The **Shawnee and Crescent Hill golf courses turned 100 in 2026**.
- ➕ **Waterfront Park** (and its West End **Phase IV / PlayPort**), **Beckley Creek Park**, **Big Rock** and **Hogan's Fountain** (Cherokee), **Beargrass Creek State Nature Preserve + Louisville Nature Center**, **Champions Park**, **Blackacre**, **McNeely Lake**, **Fairmount Falls** (JMF), **Riverside**, and **Otter Creek Outdoor Rec Area** (Meade Co.).

## 🥕 Grocery (L595–L609)

- ✓ Five Star Halal (310 W Woodlawn, Somali-owned), Supermercado Guanajuato, Frank's, Lotsa Pasta, Red Hog, Rainbow Blossom (moved into the former Paul's Fruit Market on Brownsboro Rd), and Patel Brothers (1850 S Hurstbourne, likely).
- ❓ **Viet Hoa Food Market, Garden Gate Fruit Market, Reardon's, Foods World**: couldn't confirm.
- ➕ **Vietnam Oriental Market** (5019 S 3rd), **Dong Phuong** (6705 Strawberry Ln), **Choi's Asian Food Market** (607 Lyndon Ln), **Anar Food Mart** (halal, 8730 Westport Rd), **Golden Key Market** (European, 3821 Bardstown Rd), **Lanceta Trading** and **My Tindahan** (Filipino), **Cuban Food Mart** (5422 New Cut Rd), and **Haymarket by Ashbourne Farms** (3020 River Rd).
- Context: the **ValuMarket** at Mid City Mall closed after 21 years. Mid City Market (likely a **Publix**) is planned for the site. The West End community grocery co-op project collapsed.

## 🎸 Music Venues (L616–L624)

- ⚠️ **Whirling Tiger** plans to close its Story Ave space at the end of 2026 and **reopen in a larger Butchertown space in early 2027**.
- ⚠️ **Portal** is at **1512 Portland Ave** (Portland; ~350 capacity). It's not in NuLu, so fix the map pin. There's also **ARTPORTAL** at 1535 Lytle St.
- ✓ **Camp Spaceman**: DIY room, 710 Barret Ave, ~100 capacity.
- ❓ **Camp Social Club**: no music venue found (only a dormant LLC on Logan St). Remove it.
- ➕ **Louisville Palace**, **Iroquois Amphitheater**, **KFC Yum! Center**, **Kaiju** (shows and comedy), **Third Street Dive**, **Surface Noise** (600 Baxter, intimate experimental shows), and **Stevie Ray's Blues Bar**.

## 🎭 Theatre / The Stage (L631–L647)

- ❌ **Comedy Caravan** (The Caravan; L646): closed **spring 2026** after ~39 years (Mid City Mall demolition).
- ⚠️ **Actors Theatre**: the **Humana Festival is over** (last edition 2021). The theatre now has co-leaders (Amelia Acosta Powell and Emily Tarquin, since Sept 2025) and a new **Storytelling Revolution Festival** with Louisville Fringe.
- ⚠️ "UL College of Art**’**s and Sciences" (L643) should be **UofL Theatre Arts (Thrust Theatre & Playhouse)**. Thrust is at 2314 S Floyd St.
- ✓ **Bunbury Theatre** is active (*Endgame*, early 2026). **Louisville Comedy Club** has 2026 shows.
- ❓ **Highview Arts Center**: planned for 7406 Fegenbush Ln; I couldn't confirm it opened.
- ➕ **Louisville Orchestra** (a big gap), **Kentucky Shakespeare**, **Pandora Productions**, **Commonwealth Theatre Center**, **The Bard's Town**, **Louisville Improvisors**, and **CenterStage** (JCC).

## ⛳ Golf & Disc Golf (L654–L672)

- ❌ The city runs **10** courses: **Bobby Nichols** (9 holes, *inside* Waverly Park, so rename the "Waverly Park" entry), Cherokee (oldest public course, 1895), Crescent Hill (1926), Iroquois, **Quail Chase (27 holes, missing from the list)**, Seneca, Shawnee (1926), Long Run, Charlie Vettiner, and Sun Valley.
- ➕ Note the **2026 centennials** of Shawnee and Crescent Hill, and **Valhalla** (private; hosted the 2024 PGA Championship).
- Disc golf ➕ **Highview Park** (new in 2025, two loops through the woods), **Arrowhead** (27 holes, top-rated scenery), and **Champions Park** (already listed).

## 📅 Notable Annual Events (L679–L708)

- ❌ **Missing: the Kentucky Derby and Kentucky Oaks** (first Saturday in May; 152nd was May 2, 2026). Also missing: the **Derby Festival marathon and miniMarathon**.
- ⚠️ **Highland Renaissance Festival** (L700) is now the **Kentucky Highland Renaissance Festival** in Eminence, held **late May–July** (2026: May 30–July 19), not October.
- ⚠️ **Louisville International Film Festival** (L699) looks dormant since 2023. Replace it with **Flyover Film Festival** (Louisville Film Society, late July).
- ⚠️ **Thunder Over Louisville**: canceled in 2025 because of historic flooding (a first). It returned Apr 18, 2026.
- ⚠️ **Steamboat Race**: usually the Wednesday before the Derby, so late April or early May.
- ✓ **Garvin Gate Blues Festival** (31st edition is Oct 9–10, 2026, happening now), **WorldFest** (Sept 4–7, 2026 on the Belvedere), and **NuLu Bock Fest** (Mar 28, 2026; 9th year).
- ❓ Frankfort Ave Easter Parade, Butchertown Art Fair, Fête de Noël, Great Balloon Race date: unverified for 2026.
- ➕ **NULU Fest** (16th in 2026), **F.A.T. Friday Trolley Hop** (Frankfort Ave), **Waterfront Wednesday** (WFPK), **Juneteenth Jubilee**, **Lights Under Louisville**, **Kentucky Bourbon Festival** (Bardstown, Sept), and **LOVB Pro Volleyball playoffs** (Freedom Hall, Apr 2026). Forecastle has been on hiatus since 2023, so leave it out.

## 🍺 Dive Bars (L715–L739)

- ❌ Duplicate Mellwood Tavern (L728/L734).
- ⚠️ **High Horse** moved from Butchertown to **810 E Market (NuLu)** in June 2025 and dropped live music.
- ⚠️ **"Dive Bar"** (L720) is real: **Dive Bar on Frankfort** (2235 Frankfort, opened 2025). Use the full name.
- ⚠️ **Canary Club** (1247 S Shelby) is a natural-wine and cocktail bar, not really a dive.
- ⚠️ **Whirling Tiger**: relocating (see Music Venues).
- ❓ **Left Field Lounge**: no trace found. Remove it unless you know it.
- ✓ Air Devils Inn (since 1934), Seidenfaden's (1921), Outlook Inn (1974), The Pearl, Kaiju, Third Street Dive, Nachbar, Merryweather, Mag Bar.
- ➕ **The Back Door** (Highlands institution), **Big Rock Bar & Brew** (formerly Great Flood). Avoid these closed bars: Silver Dollar (Nov 2025), Meta (Mar 2026), Down One Bourbon Bar (Oct 2026), Corridor Bar, Nowhere and Somewhere bars, Baxter's 942.

## 🥃 Breweries & Distilleries (L743–L774)

- ⚠️ **Description**: "more barrels than *people living here*" is a **Kentucky** stat, not Louisville's.
- ❌ **Bluegrass Brewing Co.** (L762): the last location (300 W Main) closed abruptly ~June 29, 2026. Remove.
- ❌ **Against The Grain** (L758): left Slugger Field Dec 23, 2025, and the Highlands pub closed in 2024. It's now production-only (Portland). Remove the "watch a Bats game" note.
- ❌ **"Louisville Distilling Company"** (L753) is Angel's Envy's corporate name, not a separate place. Delete it.
- ❌ **Bulleit Frontier Whiskey Experience** (L754) is at **Stitzel-Weller in Shively**, not on "Shelbyville Rd." Bulleit's separate distillery visitor center is in **Shelbyville, KY**. Merge it with L755 or fix it.
- ⚠️ **Angel's Envy** is at 500 E Main (by Slugger Field), not quite Whiskey Row.
- ⚠️ **Copper & Kings**: bought back from Constellation by local Bourdon Spirits (Aug 2025). Rooftop bar and tours are still running.
- ⚠️ **TEN20** closed its Douglass Loop taproom (Apr 2025); the Butchertown flagship remains.
- ⚠️ Goodwood closed both Louisville taprooms (Mar 2026) and isn't listed anyway. Hi-Wire's Louisville taproom also closed.
- ✓ Atrium (Logan St, plus Norton Commons), Akasha, Noble Funk, Gallant Fox, Hop Atomica (brewery + micro-distillery, Schnitzelburg), Butchertown Brewing (Mellwood Arts Center), Old Louisville Brewery, Trellis (Smoketown), West Sixth NuLu, 3rd Turn (a third Four Pegs is coming next door in J-town), Holsopple, Mile Wide, Monnik (a Rose Hill Lager Haus was announced in 2025).
- ➕ Distilleries: **Kentucky Peerless** (120 N 10th), **Brough Brothers** (Kentucky's first Black-owned distillery, Park Hill), **Pursuit Spirits**, **Green River** tasting room, **Prova Spirits** (Phoenix Hill nano, 2025), and the **Chicken Cock** tasting room (NuLu). Jim Beam Urban Stillhouse is closed, so don't add it.
- ➕ Breweries: **Shippingport Brewing / Sally Forth Taproom** (Portland, 1221 W Main), **Falls City Beer**, **Apocalypse Brew Works** (1612 Mellwood), **Big Rock Bar & Brew**, **Greenside Pizzeria by Gravely** (Butchertown, Feb 2026), and **Country Boy taproom** (Falls City Market at the Omni).

## ☕ Coffee (L781–L815)

- ❌ **Barista Parlor**: its only Louisville shop (downtown) closed Jan 2026.
- ❌ **North Lime Coffee & Donuts**: the Old Louisville shop closed Jan 2025.
- ❌ **Nook and Nowhere**: closed May 31, 2026.
- ⚠️ **Please & Thank You**: filed Chapter 11 in June 2026 and was **sold in Sept 2026** to the Good Folks and Wild Eggs owners. Three shops remain.
- ⚠️ **Butchertown Bakery**: see Dining L24.
- ⚠️ **Pregame**: moved from NuLu to Frankfort Ave (Clifton) in 2022 *(verify it's still open)*.
- ✓ **Witches Brew** (1813 Frankfort, opened Aug 2024), **Ntaba Coffee Haus** (2407 Brownsboro Rd + Fern Valley), **Phalcha** (1001 Mary St, Germantown, + a St. Matthews location since Sept 2025), **La Pana** (991 Logan St), **The Well Coffee Co.** (5225 New Cut Rd, the former Sister Bean's), **Haymarket by Ashbourne Farms** (3020 River Rd), **Bayt Al Mocha**, **Blak Koffee**, **Blackbeard Espresso**, **Bean** (Goss Ave), and **Fante's** (private-label roaster).
- ❓ **Hinterhof, Goldies, Louisville Joe, Brew & Sip** (a Brew & Sip Express exists in Okolona/Audubon), **Ithmah** (named as Ntaba's roaster), **Day's**, **Haraz**: most map pins are guesses.
- ➕ **Lucia's Cafecito y Más**, **Billion Cup Coffee** (Clifton), **Mixmix Cafe**, **Carter Coffee Co.** (South End), **Dogebeans**, **Elixir Cafe** (Crescent Hill), **Cup of Joy** (Portland), and **Sunergos** (already listed; top-rated).

## 🏟️ Sports (L822–L828)

- ❌ **Bellarmine** (L822) moved **back to Knights Hall** for 2024–25. It no longer plays at Freedom Hall.
- ➕ **Louisville Kings (UFL)**: debuted in 2026 at Lynn Family Stadium and **won the United Bowl in their first season** (27–20 over DC, June 13, 2026).
- ➕ **UofL volleyball** (perennial top-10; national runner-up in 2022 and 2024), **UofL baseball** (Jim Patterson Stadium), **UofL women's basketball**, **Churchill Downs** (spring and fall meets), and **Louisville Roller Derby**.
- ⚠️ The NBA's 2026 expansion vote went to Seattle and Las Vegas, so skip any "NBA coming" hopes.

## 🎓 Education (L836–L850)

- ⚠️ **McKendree University** moved its Louisville operations to **Shepherdsville** (Bullitt Central's College & Career Center) in 2016. Drop it or note "Shepherdsville."
- ❓ **Indiana Wesleyan Louisville Ed Center** (1500 Alliant Ave): still listed, but confirm programs.
- ⚠️ Simmons College is an **HBCU**, so a "Seminaries & Religious Colleges" header undersells it.
- ✓ Spalding: new president (Anne Kenworthy, 2025) and new health programs for fall 2026. Sullivan absorbed Spencerian and the College of Technology & Design (2018).
- ➕ **Kentucky School for the Blind**, **Ivy Tech Sellersburg**, **Louisville Bible College** *(verify)*.

## 📚 Libraries (L857–L874)

- ❌ **Highlands-Shelby Park** (L862) closed at the end of **Aug 2026** with Mid City Mall's demolition. A new ~12,000 sq ft standalone branch is planned on the site (about 2 years).
- ➕ **Fern Creek** (new $19M branch, opening early 2027), **Parkland** (being restored at 28th & Virginia), **Portland** (closed for renovation; confirm reopening). Together these bring LFPL to 19 branches.
- ⚠️ The Louisville Tool Library isn't an LFPL branch, so consider moving it to Clubs.

## 📰 Louisville Media (L882–L897)

- ⚠️ **WDRB (Fox) + WAVE (NBC)**: Gray bought WDRB (closed May 6, 2026). The newsrooms merged into **wdrbwave.com** in Sept 2026, so the L887/L888 URLs may redirect.
- ⚠️ **LEO Weekly**: down to one editorial staffer as of Jan 2025, but still publishing. UofL Libraries took its archive in 2026.
- ⚠️ **Louisville Public Media**: cut staff in 2024 and 2025. Federal CPB funding ended **Jan 2026**.
- ⚠️ **WLOU** is **1350 AM**; 104.7 FM is a translator. R&B since 1951 ✓.
- ✓ Courier Journal Pulitzers ≈ 11 (latest 2020).
- ➕ **Kentucky Lantern** (nonprofit statehouse news), **Spectrum News 1**, **Louisville Defender** (historic Black weekly) *(verify current status)*, **The Louisville Cardinal** (UofL), **Food & Dining Magazine**, **Louisville Hot Bytes**, **LOUtoday** (6AM City), **Broken Sidewalk**.

## 🛍️ Local Business (L904–L930)

- ⚠️ "Flea de Fleur" (L910) should be **Fleur de Flea**.
- ⚠️ **Better Days Records**: the **East** shop (Barret Ave) is open; **Better Days West** (Lyles Mall) closed after 30+ years.
- ✓ **Caufield's Novelty** (1006 W Main, since 1920; the **36-ft vampire bat** on the building is a great bingo square), **Mom's Music** (Mellwood Ave), **Idlewild Butterfly Farm** (1100 Logan St, not where the map puts it), **Logan Street Market** (open; Shelby Park, not Smoketown), **Surface Noise** (600 Baxter), **Guestroom** (Frankfort Ave), **Louisville Antique Market** (845 E Jefferson).
- ❌ **Electric Ladyland** announced in June 2026 that it was closing after 48 years (removed).
- ✓ Since confirmed: **Keith's Hardware** (the True Value at 1201 Bardstown Rd), **Oscar's Hardware** (since 1950; Frankfort Ave + Germantown), **Preston Arts Center** (moved to 8101 Warwick Ave, Lyndon), and **Natural Mystic** (an active company on Bardstown Rd).
- ❓ **Doo Wop Shop** (only found one in Frankfort, KY), **Leatherhead**, **Swag's Sport Shoes**, **Home Skateshop**, **Work the Metal** (mentioned as a Butchertown Market furniture tenant).
- ➕ **Matt Anthony's Record Shop** (moved to 2354 Frankfort Ave with **Paul Wheeldon's Second Hand Books**), **Modern Cult Records** (Frankfort Ave), **Astro Black Records** (Oak St), **Hadley Pottery** (1570 Story Ave, saved in 2022), **Louisville Stoneware**, **Cellar Door Chocolates** (Butchertown Market), **Bourbon Barrel Foods**.

## 🚲 Bike Shops (L937–L945)

- ✓ Falls City Community BikeWorks.
- ✓ Confirmed in the city's bike-shop directory: **Parkside Bikes** (1377 Bardstown Rd, active 2026), **On Your Left Cycles** (625 Baxter Ave; renamed from "On your Left"), **CycleSmiths** (3928 Shelbyville Rd), **N+1 Bikes** (12001 Shelbyville Rd), **Middletown Cycling** (11519 Shelbyville Rd, Giant dealer).
- ❓ **Shifty Business Cycleworks** (city says 1125 Logan St, another listing says 125 W Oak St), **Grit Cycling** (2020 S Preston St, no recent activity), **Vic's Classic Bikes** (city says 3141 Preston Hwy, but it may have moved to 912 Baxter Ave).
- ➕ **Pedal Power** (Beargrass Christian Church bike ministry, about 600 bikes a year to people in need).

## 📖 Bookstores (L952–L957)

- ❌ **Nook and Nowhere** closed May 31, 2026.
- ✓ **Carmichael's** (since 1978; Bardstown Rd, Frankfort Ave, + Carmichael's Kids), **Foxing Books** (1314 Bluegrass Ave, South End), **Butcher Cabin Books** (horror, Barret Ave), **A Novel Romance** (moved to **Jeffersontown**), **Set & Setting** (queer bookstore and café inside ARTPORTAL).
- ➕ **Paul Wheeldon's Second Hand Books**, **Yer Mom's Book & Wine Cafe** (coming to NuLu Marketplace), and Independent Bookstore Day's **"Read for the Roses"** passport.

## 🎬 Cinema & Drive-Ins (L964–L973)

- ✓ RIP Baxter Avenue Theatres: closed **Dec 31, 2025**. Add the date.
- ⚠️ "Xscape Theatres" is **Xscape Blankenbaker 14**. Tinseltown is Cinemark Tinseltown & XD.
- ❓ **"Preston Hwy Drive-In, since 1945, cash only"**: no evidence it exists. Remove it unless you know it firsthand.
- ➕ **Floyd Theater** (UofL), the **downtown summer drive-in series**, **Flyover Film Festival**, and a RIP line for **Village 8** (closed 2022).

## 🚗 Day Trips (L981–L996)

- ❌ **"Clermont — Jim Beam & Heaven Hill"** (L984): Heaven Hill is in **Bardstown**, not Clermont. Clermont has **Jim Beam** and **Bernheim**.
- ❌ **Bernheim** (L982): fix the giants' names (no "Ent") and the drive time (~30–35 min).
- ⚠️ **Mammoth Cave** (L988): about 1.5 hrs. The Historic Tour's highlights are the Rotunda, Bottomless Pit, and Fat Man's Misery; "Cathedral Domes" isn't part of it.
- ⚠️ **Lexington** (L990): Buffalo Trace is in **Frankfort**.
- ⚠️ **Land Between the Lakes** (L995): closer to 3 hrs.
- ⚠️ **Natural Bridge** (L996) duplicates the Red River Gorge entry (L989). Merge them.
- ➕ **Maker's Mark** (Loretto), **Four Roses**, **Wild Turkey**, **Abbey of Gethsemani**, **Lincoln Birthplace** (Hodgenville), **Shaker Village of Pleasant Hill**, **Keeneland / Kentucky Horse Park**, **Huber's Orchard** (Starlight, IN), **Madison IN + Clifty Falls**, **French Lick / West Baden Springs**, **Holiday World** (Santa Claus, IN), **Marengo / Squire Boone caverns**, the **Corvette Museum** (Bowling Green), and the **Kentucky Highland Renaissance Festival** (Eminence).

## 🧺 Farmers Markets (L1004–L1012)

Replace most of this section. The current entries are:

| Line | Entry | Verdict |
|---|---|---|
| L1004 | "Louisville Farmers Market, NuLu (Jefferson St), Saturday, the biggest" | ❌ Apparently the **Louisville, Colorado** market (Front St). The real NuLu market is **Phoenix Hill/NuLu Farmers Market**, *Tuesdays* 3–6, 1007 E Jefferson. |
| L1005 | Tom Sawyer Park Farmers Market | ❌ No such market |
| L1006 | Bardstown Road FM, Sundays at Mid-City Mall | ❌ **Saturdays**, Bardstown Road Presbyterian (1722 Bardstown Rd) + the Deer Park Baptist lot. Year-round. |
| L1008 | Irish Hill Market | ❓ Not found |
| L1009 | St. Matthews FM, Thursday evenings | ❌ **Saturdays 8–noon**, Beargrass Christian Church, May–Sept |
| L1010 | Logan Street Market, Smoketown | ⚠️ It's in **Shelby Park** (1001 Logan) and is a market hall, not a farmers market |
| L1011 | West Louisville FM | ⚠️ Now the **West End Farmers Market**, California Park (1600 St. Catherine), every other Sunday |
| L1012 | Shelby Park FM | ❓ Not found |

**Verified 2026 Louisville markets:** Bardstown Road (Sat, year-round), **Douglass Loop** (Sat, 2005 Douglass Blvd), **Crescent Hill Community Market** (Thu 3–6), **Old Louisville FM** (Central Park, alternate Saturdays), **Gray Street FM** (Thu, downtown medical campus), **Jeffersontown** (Sat), **East End FM** (Factory Ln, Tue and Sat, year-round), **Beulah Church FM** (Fern Creek, year-round), **Rainbow Blossom FM** (St. Matthews, Sun), **Riverside FM** (Farnsley-Moremen, Sun), **South End Community & Artisan Market** (Iroquois Park, Sat), **Shively Farmers & Artisans**, **Westport Road FM**, **Norton Commons** (Sun), plus **Jeffersonville** (Big Four Station) and **New Albany** across the river.

## 🏘️ Neighborhoods (L1019–L1031)

- ⚠️ **Jeffersontown** (L1030): founded **1797**, but incorporated as a city later (1867 in most histories) *(verify)*. "Incorporated in 1797" conflates the two.
- ⚠️ **Highlands** (L1021): "originally settled heavily by German Catholic immigrants" is shaky. Germantown and Schnitzelburg were the German-Catholic enclaves.
- ⚠️ **Portland** (L1023): annexed 1837, separated 1842, re-annexed 1852. The back-and-forth is worth a line.
- ✓ Smoketown, Russell/Walnut Street, Old Louisville, Butchertown, and Downtown read well.
- ➕ Missing neighborhoods: **Shelby Park** (Logan St corridor boom), **Schnitzelburg** (Dainty), **Paristown Pointe**, **Phoenix Hill**, **Irish Hill**, **Limerick**, **Cherokee Triangle**, **Deer Park/Belknap/Douglass Loop**, **Audubon Park** (its own city), **Shively** (its own city), **Newburg** (historic Black community), **Shawnee/Chickasaw/Parkland/California**, **Fern Creek/Okolona/Valley Station/PRP**, **Prospect/Anchorage/Norton Commons**, and **Highland Park** (demolished for the airport expansion in the 1990s; a strong history entry).
- ➕ 2025–26 context: Mid City Mall demolition and redevelopment, the Highlands "moist" petition (dropped July 2026), Goss Ave's two-way conversion (2026), **Norton West Louisville Hospital** (2024; the first West End hospital in generations), and Waterfront Park's westward expansion into Portland.

## ⏳ Louisville History Timeline (L1039–L1098)

### ❌ Fix

| Line | Says | Should say |
|---|---|---|
| L1050 | 1839 Kentucky School for the Blind | **1842** |
| L1056 | 1868 Water Tower begins operation | **1860** (matches Landmarks L531) |
| L1061 | 1890 "EF4" tornado | F4-equivalent (it predates the Fujita scale). Deaths are usually given as 76–120. |
| L1066 | 1901 Seelbach opens | **1905** (Landmarks L544 already says 1905) |
| L1072 | 1925 Palace opens | **1928** (Landmarks L551 already says 1928) |
| L1073 | 1927 Bowman Field opens | **1919–1921** (federal lease 1919, flights 1920, opened 1921). It's Kentucky's oldest civil airport. |
| L1081 | 1968 riots "following the assassination of MLK Jr." | The **May 27, 1968** West End uprising was sparked by a local police confrontation, weeks after the assassination |
| L1084 | 1981 Galleria opens | **Sept 29, 1982**. Fourth Street Live! opened **2004**. |
| L1098 | 2021 Lynn Family Stadium opens | **2020** |
| L1064 vs L537 | St. James Court 1895 vs 1880 | Pick one (1890s) |

### ➕ Add (2010s–2026)

- **2015–16**: Abraham Lincoln Bridge and Lewis & Clark (East End) Bridge open.
- **2019**: Airport renamed Louisville Muhammad Ali International.
- **2022**: Craig Greenberg elected mayor.
- **2023**: Old National Bank shooting (Apr 10). DOJ issues its findings on LMPD (Mar).
- **2024**: Norton West Louisville Hospital opens. The **150th Kentucky Derby** (Mystik Dan). The PGA Championship at Valhalla.
- **2025**: Historic April Ohio River flood, and **Thunder is canceled for the first time**. Sovereignty wins the 151st Derby. Waterfront Park's PlayPort opens. **UPS Flight 2976** (an MD-11) crashes on takeoff on **Nov 4**, killing **15**. Baxter Avenue Theatres closes Dec 31.
- **2026**: CPB shutdown hits Louisville Public Media (Jan). The **Louisville Kings win the UFL title in their first season** (June 13). **Golden Tempo** wins the 152nd Derby, and **Cherie DeVaux becomes the first woman to train a Derby winner** (May 2). Mid City Mall closes for redevelopment (Sept). WDRB and WAVE merge newsrooms (Sept). APH's Dot Experience opens (Oct 30).
- Small tweak: GE Appliance Park (L1079) is now **Haier-owned** (since 2016).

---

## 💎 Hidden Gems (`js/easter_eggs.js` L389–L398)

| Gem | Issue |
|---|---|
| Hillerich & Bradsby Factory Tour | ❌ **Not free.** Adult admission is about $24, and it's the most-visited attraction downtown, so it's hardly hidden. |
| Butchertown Market | ⚠️ Not "tiny." It's a sprawling former industrial building anchored by Cellar Door Chocolates. |
| Cave Hill Cemetery | ⚠️ Also Muhammad Ali, and not exactly hidden |
| Shawnee Park Boat Ramp | ❓ Couldn't confirm a public boat ramp. Swap in **Shawnee Park's Great Lawn / Dirt Bowl courts**. |
| Hadley Pottery | ⚠️ Known for whimsical blue farm-animal designs (roosters are only part of it). Nearly closed in 2022, saved by Brook Smith. |
| Mellwood Arts Center "First Fridays only" | ❓ Unverified |

**Better hidden gems:** Caperton Swamp, Beargrass Creek State Nature Preserve, the **Witches' Tree** (6th & Park), **Columbia Gym**, **Thomas Edison House**, **Squire Earick House**, **Baxter Square** (Louisville's first public cemetery), **Fairmount Falls**, **Riverside Farnsley-Moremen**, **Schimpff's** (Jeffersonville), the **Caufield's vampire bat**, and **Louisville Stoneware**.

## 🃏 Bingo (`js/bingo.js`)

- ⚠️ "Find the Castleman statue pedestal": the statue came down in 2020. Confirm the pedestal is still there.
- ⚠️ "Attend a First Friday Trolley Hop": the trolley hop that's confirmed running is the **F.A.T. Friday Hop** on Frankfort Ave.
- ⚠️ "Read a LEO Weekly cover-to-cover": still works as a joke, but LEO is much thinner now.
- ➕ New squares: *Spot the giant vampire bat on Caufield's*, *Watch a Kings game*, *See the Big Four Bridge light show*, *Eat a Benedictine sandwich*, *Hear "it's LUH-vul" corrected at a bar*, *Sit through a Bardstown Rd parking hunt on a Saturday*, *Order a Hot Brown at the Brown*, *Catch Waterfront Wednesday*, *Get stuck behind the Goss Ave construction*, *Spot Thunder smoke from a rooftop*.

## 🍻 Dive Bar Crawl (`js/crawl.js` L5–L10)

- ❌ **Air Devils Inn** is grouped under "Old Louisville / Downtown," but it's at 2802 Taylorsville Rd (by Bowman Field).
- ❌ **High Horse** is under Clifton, but it's now in **NuLu**.
- ❓ **Left Field Lounge** (Highlands): couldn't confirm.
- ⚠️ Hauck's Corner and Four Pegs aren't dives. Spring Street Bar is Irish Hill, not Clifton.
- Suggested sets. **Germantown:** Nachbar, Seidenfaden's, Merryweather, The Pearl. **Highlands:** Bambi, Outlook Inn, Hideaway, Back Door, Kern's. **Clifton/Crescent Hill:** Mellwood Tavern, Dive Bar on Frankfort, Clifton Tavern, Frankfort Ave Beer Depot. **Old Louisville/Downtown:** Mag Bar, Granville, Third Street Dive.

## 🎰 Perfect Night Out slot (`js/slot.js` L8–L29)

- ❌ **"Hit the arcade at GameWorks"**: no Louisville GameWorks.
- ❌ **"Axe throwing at Bury the Hatchet"**: no Louisville location. Use **Flying Axes**, **OVRDRIVE** (112 W Jefferson, axes, sims, and a rage room), or **Full Throttle Adrenaline Park** (J-town).
- ❓ "Mini golf at Poplar Creek," "Putt-Putt at Glassworks," "Karaoke at Red Top Lounge," "Pool at Blue Dog Billiards": no trace of any.
- ➕ Real swaps: **Topgolf** (Oxmoor), **GoodBounce Pickleball Yard**, **South Seas Tiki & Golf Lounge**, **Tilt Pinball**, **Noraebar karaoke**, **Howl at the Moon**, **8Up rooftop**, **Thirsty Pedaler**, **Derby City Gaming Downtown**, **Recbar**.

---

## Sources

Closures and openings
- Food & Dining Magazine "Openings & Closings" feed, Sept 2024 – Oct 2026: https://foodanddine.com/category/openings-closings/
- LEO Weekly, 2025 closures: https://www.leoweekly.com/food-drink/louisville-and-southern-indiana-restaurants-that-closed-in-2025-so-far-17954688/
- Bristol Highlands closing: https://www.wave3.com/2026/02/25/bristol-bar-grille-closing-original-highlands-location-after-nearly-50-years/ · downtown: https://foodanddine.com/bristol-bar-grill-will-close-downtown-after-service-on-may-24/
- BBC closes: https://foodanddine.com/the-hits-just-keep-coming-bluegrass-brewing-co-expires-after-32-years/
- La Bamba: https://foodanddine.com/?p=48583
- Against the Grain leaves Slugger Field: https://www.wave3.com/2025/11/13/against-grain-public-house-announces-it-will-not-renew-its-lease
- Goodwood taprooms: https://www.wdrb.com/news/business/goodwood-brewing-closes-two-louisville-taprooms-amid-lawsuits-ownership-talks/article_fc1ae5cc-8d55-43a5-870c-0fc9772b5744.html
- Comedy Caravan: https://www.wdrb.com/news/business/louisville-s-oldest-comedy-club-closing-after-nearly-40-years-amid-mid-city-mall-redevelopment/article_6ae99d2b-5c1f-4006-88c9-93652afe295a.html
- Baxter Avenue Theatres: https://www.lpm.org/news/2025-12-22/beloved-baxter-avenue-theatres-to-close-owner-says
- Highlands-Shelby Park library: https://www.wdrb.com/news/business/highlands-shelby-park-library-prepares-to-close-with-mid-city-mall-set-to-be-demolished/article_b9ff68ee-f672-44ad-aaaf-01189e83b05e.html · Fern Creek: https://www.wave3.com/2026/08/04/19-million-construction-fern-creek-library-enters-final-stages/
- Please & Thank You sale: https://dailycoffeenews.com/2026/09/14/in-louisville-please-thank-you-sold-to-owners-of-coffee-supplier-good-folks/
- Black-owned restaurants: https://www.leoweekly.com/louisville/these-black-owned-louisville-restaurants-are-serving-up-world-class-cuisine-updated/Slideshow/15744810 · Xhale: https://hoodline.com/2026/08/xhale-restaurant-cuts-ribbon-in-louisville/
- Somali restaurants: https://foodanddine.com/new-restaurant-serves-somali-food/

Culture, venues, attractions
- Speed free Sundays: https://www.wave3.com/2026/01/02/speed-art-museum-discontinue-weekly-free-sundays-after-decrease-funding
- Dot Experience: https://thedotexperience.org/about/ · SAR museum: https://en.wikipedia.org/wiki/SAR_Education_Center_and_Museum
- Waterfront PlayPort: https://spectrumnews1.com/ky/louisville/human-interest/2025/03/26/community-celebrating-grand-opening-of-waterfront-park-expansion-in-louisville
- Mega Cavern bike park: https://mbaction.com/gone-but-not-forgotten-louisville-kentuckys-underground-bike-park
- Zoo Kentucky Trails: https://www.wdrb.com/news/louisville-zoo-unveils-new-renderings-for-100m-kentucky-trails-project/article_bf9adc1b-8775-46e5-ad56-425d494264c4.html
- Extreme Park hours: https://louisvilleky.gov/government/parks/park-list/david-armstrong-extreme-park
- Rocksport: https://www.lpm.org/news/2026-03-13/rocksport-climbing-gym-in-jeffersontown-to-reopen-under-new-ownership
- Whirling Tiger move: https://wdrb.com/news/business/louisville-music-venue-bar-planning-to-relocate-in-early-2027/article_bec21e05-9bd8-423a-94d7-1d158e6dffaf.html
- High Horse move: https://www.wdrb.com/news/business/high-horse-bar-to-reopen-in-nulu-this-week-after-move-from-butchertown/article_0a3f9724-7fd8-4f3f-892d-a2281c332ebb.html
- Portal: https://www.songkick.com/venues/4436414-portal-fifteentwelve-music
- Actors Theatre leadership: https://www.wave3.com/2025/09/15/new-leadership-announced-actors-theatre-louisville
- Metro golf (10 courses): https://louisvilleky.gov/news/mayor-craig-greenberg-announces-louisville-parks-recreations-2026-golf-passes-are-now-sale
- Highview Park disc golf: https://www.pdga.com/node/307283
- Bernheim giants: https://bernheim.org/must-sees/forest-giants/ · Caperton Swamp: https://www.wildernesslouisville.org/natural-areas/caperton-swamp/
- Olmsted parks: https://olmsted.org/sites/louisville-park-system
- Matt Anthony's move: https://www.lpm.org/another-louisville-record-store-moving-frankfort-avenue
- Copper & Kings sale: https://www.fredminnick.com/2025/08/07/bourdon-spirits-acquires-copper-kings/
- Brough Brothers: https://louisvilleky.gov/news/brough-brothers-opens-craft-distillery-louisvilles-park-hill-neighborhood
- Hadley Pottery: https://hadleypottery.com/blogs/news/hadley-potter-is-staying-open

Events, sports, media, history
- 2026 farmers market guide: https://www.aol.com/articles/2026-guide-20-farmers-markets-090141000.html
- Thunder 2025 cancellation: https://discover.kdf.org/press_release/04-05-25-2025-thunder-over-louisville-cancelled-due-to-historic-flooding/
- Steamboat Race 2026: https://spectrumnews1.com/ky/lexington/news/2026/04/30/great-steamboat-race
- Highland Renaissance Festival: https://spectrumnews1.com/ky/louisville/news/2026/07/19/kentucky-highland-renaissance-festival-wraps-season-after-eight-weekends
- Garvin Gate 2026: https://www.gotolouisville.com/media/news-stories/31st-annual-garvin-gates-blues-festival-returns/
- Highlands moist petition: https://louisvilleky.gov/news/highlands-moist-petitions-suspended-after-agreements-reached-louisville-hospitality
- Louisville Kings title: https://www.wave3.com/2026/06/15/united-bowl-recap-kings-outlast-defenders-claim-ufl-crown-complete-historic-inaugural-season/
- Bellarmine arena: https://en.wikipedia.org/wiki/2025%E2%80%9326_Bellarmine_Knights_men%27s_basketball_team
- 2026 Derby: https://en.wikipedia.org/wiki/2026_Kentucky_Derby
- UPS crash: https://www.cbsnews.com/news/death-toll-ups-cargo-plane-crash-louisville-rises-to-15
- WDRB+WAVE: https://www.wave3.com/2026/08/26/wdrb-wave-bring-2-strong-digital-news-brands-together/
- CPB shutdown: https://www.wdrb.com/news/kentucky-public-media-braces-for-change-after-corporation-for-public-broadcasting-shuts-down/article_df673839-1adc-4873-b64c-52a09180e569.html
- LEO staffing: https://lpm.org/news/2025-01-10/leo-weekly-fires-remaining-editors-down-to-one-editorial-staffer
- Oldest restaurants: https://www.gotolouisville.com/blog/louisvilles-oldest-restaurants/ · Old Louisville Tavern (2013): https://www.wdrb.com/news/business/owners-of-old-louisville-tavern-to-open-takeout-only-location-this-march/article_aff0f79e-e277-11ef-9f53-dbee743a340c.html · Jack Fry's: https://www.louisvillehotbytes.com/the-more-jack-frys-changes-the-more-it-stays-the-same
- Bowman Field: https://en.wikipedia.org/wiki/Bowman_Field_(Kentucky) · Galleria: https://en.wikipedia.org/wiki/Fourth_Street_Live! · First cemetery: https://louisvilleky.gov/government/parks/cemeteries · WLOU: https://en.wikipedia.org/wiki/WLOU
- McKendree relocation: https://www.mckendree.edu/news/phased-relocation.php
