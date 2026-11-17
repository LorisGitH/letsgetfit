# letsgetfit

A solo training app: one person sets a fitness objective, declares what they can do and what equipment they own, and follows a plan built for them, with no coach and no social features.

## Language

**Athlete**:
The one person whose training data an installation holds. Each installation has exactly one Athlete; there is no sign-in.
_Avoid_: User, account, member, client

### Objectives

**Goal**:
The single primary outcome the Athlete is training for: Gain Muscle, Lose Fat, or Recomposition (both at once). An Athlete has exactly one active Goal.
_Avoid_: Objective, target, aim

**Recomposition**:
The Goal of losing fat and gaining muscle at the same time.
_Avoid_: Recomp, toning

**Focus Area**:
A body region the Athlete wants to prioritise (e.g. belly, arms). It shapes which muscles get extra work; it does not mean fat is burned from that region specifically.
_Avoid_: Spot reduction, target zone, problem area

**Muscle**:
One of the fixed muscle groups Exercises are tagged with (e.g. abdominals, lats, quadriceps). Each Focus Area maps to one or more Muscles.
_Avoid_: Muscle group, body part

**Joint**:
One of the fixed joints or regions an Exercise can strain (e.g. knee, lower back, wrist). Limitations are expressed as Joints.
_Avoid_: Articulation, body part

**Limitation**:
A joint or body region the Athlete must spare (e.g. knee, lower back). Generated Plans leave out Exercises that strain it; the Athlete may still add one back by hand.
_Avoid_: Injury, condition, restriction

### Exercises and equipment

**Exercise**:
A named movement, tagged with the muscles it works, the joints it strains, the Equipment it requires, and any Equipment it can optionally use (e.g. push-up bars for push-ups). Every Exercise is either Strength (measured in sets and reps or load) or Cardio (measured in duration or distance).
_Avoid_: Move, drill, activity

**Cardio Habit**:
A Cardio Exercise the Athlete already does on a regular schedule (e.g. a 5 km run every Tuesday and Thursday). It becomes a Session in their Plan.
_Avoid_: Routine, activity, sport

**Catalogue**:
The built-in set of Exercises that ships with the app.
_Avoid_: Library, database

**Custom Exercise**:
An Exercise the Athlete created themselves, outside the Catalogue.
_Avoid_: User exercise, personal exercise

**Repertoire**:
The Exercises the Athlete has declared they are comfortable performing.
_Avoid_: Known exercises, favourites, skills

**Equipment**:
A physical tool an Exercise may require (e.g. push-up bars, resistance band, pull-up bar).
_Avoid_: Tool, gear, accessory

**Custom Equipment**:
Equipment the Athlete added that the Catalogue doesn't know. Only Custom Exercises can require it.
_Avoid_: Other equipment, misc

**Inventory**:
The Equipment the Athlete owns, including any Custom Equipment.
_Avoid_: Kit, my gear

### Planning

**Experience Level**:
How trained the Athlete is (Beginner, Intermediate, Advanced). It sets the starting volume and intensity of the Plan.
_Avoid_: Fitness level, skill level

**Availability**:
The weekdays the Athlete can train (their Training Days) and how long each Session may last.
_Avoid_: Schedule, free time, frequency

**Plan**:
A template week of Sessions that repeats, generated for the Athlete from their Goal, Focus Areas, Repertoire, Inventory, Cardio Habits and availability. The Athlete may edit it.
_Avoid_: Program, routine, schedule, workout plan

**Session**:
One workout on one weekday of the Plan, made of Strength Exercises, Cardio Exercises, or both, each with its Target.
_Avoid_: Workout, training, class

**Target**:
What a Session asks for one Exercise: sets and reps or load for Strength, duration or distance for Cardio.
_Avoid_: Prescription, goal, objective

**Progression**:
A change to a Target suggested from the Athlete's Logged Sessions (harder after a fully completed Target, held or eased after repeated misses). It applies only once the Athlete accepts it.
_Avoid_: Overload, level-up, adaptation

**Suggestion**:
A Catalogue Exercise outside the Athlete's Repertoire that their Inventory allows, proposed for adding to the Repertoire. A Plan never contains an Exercise outside the Repertoire.
_Avoid_: Recommendation

### Tracking

**Logged Session**:
A record of what the Athlete actually did on a given date, linked to the Session it carried out when there was one. Logged Sessions without a planned Session are allowed.
_Avoid_: Workout history, entry, log entry, activity

**Body Stats**:
The Athlete's date of birth, sex (male, female, or not stated), height and weight, used as a baseline and for the Calorie Target.
_Avoid_: Profile, biometrics

**Measurement**:
A dated record of body weight or a body circumference (e.g. waist, arm). Circumferences are how progress in a Focus Area is seen.
_Avoid_: Metric, stat, check-in

**Calorie Target**:
An estimated daily calorie and protein intake for the Athlete's Goal, always presented as an estimate. letsgetfit does not log food.
_Avoid_: Diet, meal plan, macros
