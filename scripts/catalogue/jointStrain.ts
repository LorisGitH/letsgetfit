/**
 * Which Joints each Exercise strains, so Limitations can leave risky Exercises out of a Plan.
 * The source has no such data: these are movement-pattern rules, reviewed by hand for every
 * kept record. When unsure, a Joint is tagged: a wrong tag only hides an Exercise the Athlete
 * can add back, while a missing one could load a joint they asked to spare.
 */
import { JOINTS, type Joint } from '../../src/domain/body/joint.ts';
import type { SourceExercise } from './tagging.ts';

/** Patterns matched against the lower-cased exercise name. */
const NAME_RULES: { pattern: RegExp; joints: Joint[] }[] = [
  // Knee-dominant leg work.
  {
    pattern: /squat|lunge|step[- ]?ups?|pistol|thruster|get-up/,
    joints: ['hip', 'knee'],
  },
  // Jumps, bounds, sprints and running drills.
  {
    pattern:
      /jump|bound|hop\b|skip|sprint|butt kick|carioca|start technique|acceleration|claw/,
    joints: ['hip', 'knee', 'ankle'],
  },
  // Hip hinges and loaded rotations through the hips.
  {
    pattern:
      /deadlift|good morning|swing|clean|snatch|hyperextension|pass between|figure 8|pirate|pass through|windmill|bent press/,
    joints: ['lowerBack', 'hip'],
  },
  // Unsupported bent-over rows.
  {
    pattern: /bent[- ]over|two-dumbbell row|kettlebell row|renegade/,
    joints: ['lowerBack'],
  },
  // Pressing, overhead work, raises, flyes, throws and slams.
  {
    pattern:
      /press|jerk|snatch|overhead|military|scaption|above head|halo|windmill|get-up|pullover|upright row|lateral raise|deltoid raise|delt raise|front .*raise|shoulder raise|dumbbell raise|laterals|cuban|iron cross|spell caster|around the worlds|flye|cross over|pull apart|throw|chest push|chest pass|slam|catch|swing|thruster|rotation/,
    joints: ['shoulder'],
  },
  // Weight on the hands: push-ups, planks, crawls, handstands.
  {
    pattern:
      /push-?ups?|pushups|handstand|plank|side bridge|mountain climber|spider crawl|body-up|downward facing balance|ball pull-in|isometric wipers|body tricep press|renegade/,
    joints: ['shoulder', 'elbow', 'wrist'],
  },
  { pattern: /\bdips?\b/, joints: ['shoulder', 'elbow', 'wrist'] },
  // Hanging and pulling up.
  {
    pattern: /pull-?ups?|pullup|chin|hanging|scapular/,
    joints: ['shoulder', 'elbow'],
  },
  { pattern: /hanging/, joints: ['lowerBack'] },
  {
    pattern: /wrist|pronation|supination|zottman|reverse curl/,
    joints: ['wrist'],
  },
  { pattern: /shrug|neck/, joints: ['neck'] },
  // Crunching with the head lifted.
  {
    pattern:
      /sit-?ups?|crunch|jackknife|cocoons|elbow to knee|heel touchers|air bike|gorilla/,
    joints: ['neck'],
  },
  // Loaded spinal flexion, rotation and leg levers.
  {
    pattern:
      /sit-?ups?|leg raise|leg lift|flutter|leg pull-in|pike|leg tucks|reverse crunch|russian twist|full twist|side bend|bottoms up|butt-ups|jackknife/,
    joints: ['lowerBack'],
  },
  { pattern: /calf raises?/, joints: ['ankle'] },
  {
    pattern:
      /bridge|butt lift|glute kickback|hip raise|monster walk|adduction|hip flexion|hip extension/,
    joints: ['hip'],
  },
  { pattern: /leg curl|glute-ham/, joints: ['knee'] },
];

/** Arm isolation strains the elbow; forearm work strains the wrist. */
const MUSCLE_RULES: { muscle: string; joints: Joint[] }[] = [
  { muscle: 'biceps', joints: ['elbow'] },
  { muscle: 'triceps', joints: ['elbow'] },
  { muscle: 'forearms', joints: ['wrist'] },
];

const CARDIO: Record<string, Joint[]> = {
  Bicycling: ['knee'],
  Bicycling_Stationary: ['knee'],
  Recumbent_Bike: ['knee'],
  Elliptical_Trainer: ['knee'],
  Jogging_Treadmill: ['hip', 'knee', 'ankle'],
  Running_Treadmill: ['hip', 'knee', 'ankle'],
  Trail_Running_Walking: ['hip', 'knee', 'ankle'],
  Walking_Treadmill: [],
  Rope_Jumping: ['knee', 'ankle'],
  Rowing_Stationary: ['lowerBack', 'knee'],
};

/** Hand-reviewed corrections, applied after the rules: `add` and `remove` lists. */
export const JOINT_OVERRIDES: Record<
  string,
  { add?: Joint[]; remove?: Joint[] }
> = {
  // Pressing, pulling or arcing a weight, though the name doesn't say so.
  Incline_Dumbbell_Bench_With_Palms_Facing_In: { add: ['shoulder'] },
  Kettlebell_Sumo_High_Pull: { add: ['shoulder', 'lowerBack', 'hip'] },
  Power_Partials: { add: ['shoulder'] },
  Return_Push_from_Stance: { add: ['shoulder'] },
  Kettlebell_Pirate_Ships: { add: ['shoulder'] },
  // The head takes weight at the bottom.
  'Handstand_Push-Ups': { add: ['neck'] },
  // Kneeling, hands down, or driving the knees.
  Kneeling_Arm_Drill: { add: ['shoulder', 'knee'] },
  Glute_Kickback: { add: ['wrist', 'knee'] },
  Mountain_Climbers: { add: ['hip'] },
  // The lower back holds the position or twists under load.
  Plank: { add: ['lowerBack'] },
  Spell_Caster: { add: ['lowerBack'] },
  'Bent-Knee_Hip_Raise': { add: ['lowerBack'] },
  'One-Arm_Dumbbell_Row': { add: ['lowerBack'] },
  // The head stays on the floor.
  Reverse_Crunch: { remove: ['neck'] },
  // Despite the name, hanging knee raises on a pull-up bar, not running.
  Wind_Sprints: {
    add: ['shoulder', 'elbow', 'lowerBack'],
    remove: ['hip', 'knee', 'ankle'],
  },
};

export function strainedJoints(source: SourceExercise): Joint[] {
  const joints = new Set<Joint>();
  if (source.category === 'cardio') {
    for (const joint of CARDIO[source.id] ?? []) joints.add(joint);
  } else {
    const name = source.name.toLowerCase();
    for (const { pattern, joints: matched } of NAME_RULES) {
      if (pattern.test(name)) for (const joint of matched) joints.add(joint);
    }
    for (const { muscle, joints: matched } of MUSCLE_RULES) {
      if (source.primaryMuscles.includes(muscle))
        for (const joint of matched) joints.add(joint);
    }
  }
  const override = JOINT_OVERRIDES[source.id];
  for (const joint of override?.add ?? []) joints.add(joint);
  for (const joint of override?.remove ?? []) joints.delete(joint);
  return JOINTS.filter((joint) => joints.has(joint));
}
