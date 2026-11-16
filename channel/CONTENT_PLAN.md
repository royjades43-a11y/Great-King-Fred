# Content Plan: analysis first

The channel explains **how and why machines work, with real numbers**, not incident stories. Every video:
1. opens on a belief most viewers hold ("planes fly high to avoid weather"),
2. breaks it with one number,
3. shows the mechanism with an animated chart built from a citable source,
4. ends with something the viewer can check themselves on their next trip.

Cadence: **3 Shorts/week** (Mon/Wed/Fri) + **1 long-form every 2 weeks**. Long-forms go deeper on the same topic and get cut back into Shorts.

| # | Working title | The belief we break | The number / mechanism | Data source | Status |
|---|---|---|---|---|---|
| 1 | Why planes fly at 35,000 ft (it's not the weather) | "To avoid storms" | 31% air density → same lift and drag at ~1.8× the speed; step climbs | ISA (ISO 2533), Anderson | ✅ `episodes/ep001_why_35000_feet.yaml` |
| 2 | Why trains don't need a steering wheel | "The flanges steer it" | Conical wheels + solid axle = self-steering | Wickens, rail dynamics | ✅ `episodes/ep002_train_steering.yaml` |
| 3 | Your flight is slower than it was in 1970 | "Planes keep getting faster" | Drag rises with speed²; cruise Mach dropped (707 ≈ 0.84, A320 ≈ 0.78) and schedules padded | Manufacturer data, airline timetables | research |
| 4 | Why flying east is faster than flying west | "Same distance, same time" | Jet stream 100–200 kt tailwinds; plot actual flight times both ways | Flight-tracking data, NOAA winds | research |
| 5 | Why planes don't fly straight lines on the map | "The map line is the short way" | Great circle vs Mercator; compute both distances | Haversine maths | research |
| 6 | Why a full jet burns fuel just to carry fuel | "Fuel is just fuel" | Breguet range equation: extra fuel weight costs fuel | Breguet, airline tankering studies | research |
| 7 | Is flying more fuel-efficient than driving? | "Planes are gas guzzlers" | L/100 passenger-km for a modern narrowbody vs a car with 1.5 occupants | ICCT efficiency reports | research |
| 8 | Why wings bend so much | "Rigid is strong" | 787 wingtips flex metres upward in flight; flexing spreads the load | Certification wing-bend test data | research |
| 9 | Why planes land into the wind | "Wind is just bumpy" | Ground speed = airspeed − headwind; shorter runway needed | Basic kinematics | research |
| 10 | Why your ears pop: the cabin is at 8,000 ft | "The cabin is at sea level" | Cabin altitude limit; pressure differential vs fuselage stress | FAA 14 CFR 25.841 | research |
| 11 | How long a 300 km/h train takes to stop | "Brakes stop it fast" | Kinetic energy ∝ v²; braking distance in km | Operator braking curves | research |
| 12 | Long-form: The physics of a flight, gate to gate | | Each phase with its own chart | All of the above | later |

## Rules for analysis videos
- **Every number on screen has a source** in the YAML `sources:` list, and any modelling assumption goes in `graphics_note:` (it's printed in the description).
- **Charts are built from data in the script** (`footage: {type: chart}`), never screenshotted from elsewhere.
- Simplifications are fine but get named: "roughly", "illustrative", "standard atmosphere".
- If a fact can't be checked, it gets cut.

## Growth loop
1. Publish → check the 48 h retention graph → find the second viewers drop.
2. That beat gets rewritten in the next script (shorter sentence, number sooner, chart earlier).
3. Top Short becomes a long-form, and the long-form is cut into 3 new Shorts.
4. Pin a comment asking viewers to report what their own flight's map showed.
