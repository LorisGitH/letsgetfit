import { describe, expect, it } from 'vitest';
import { strainedJoints } from './jointStrain';
import type { SourceExercise } from './tagging';

const source = (overrides: Partial<SourceExercise>): SourceExercise => ({
  id: 'Example',
  name: 'Example',
  category: 'strength',
  equipment: 'body only',
  level: 'beginner',
  primaryMuscles: ['chest'],
  secondaryMuscles: [],
  instructions: ['Do it.'],
  images: [],
  ...overrides,
});

const joints = (overrides: Partial<SourceExercise>) =>
  strainedJoints(source(overrides));

describe('strainedJoints', () => {
  it('lists Joints in head-to-toe order without duplicates', () => {
    expect(
      joints({ name: 'Kettlebell Thruster', equipment: 'kettlebells' }),
    ).toEqual(['shoulder', 'hip', 'knee']);
  });

  it('tags knees and hips for squats and lunges', () => {
    expect(
      joints({ name: 'Bodyweight Squat', primaryMuscles: ['quadriceps'] }),
    ).toEqual(['hip', 'knee']);
    expect(
      joints({ name: 'Dumbbell Lunges', primaryMuscles: ['quadriceps'] }),
    ).toEqual(['hip', 'knee']);
  });

  it('adds ankles for jumping and running', () => {
    expect(joints({ name: 'Star Jump', category: 'plyometrics' })).toEqual([
      'hip',
      'knee',
      'ankle',
    ]);
    expect(
      joints({
        id: 'Running_Treadmill',
        name: 'Running, Treadmill',
        category: 'cardio',
      }),
    ).toEqual(['hip', 'knee', 'ankle']);
  });

  it('tags the lower back and hips for hinges and swings', () => {
    expect(
      joints({
        name: 'Stiff-Legged Dumbbell Deadlift',
        primaryMuscles: ['hamstrings'],
      }),
    ).toEqual(['lowerBack', 'hip']);
    expect(joints({ name: 'One-Arm Kettlebell Swings' })).toEqual([
      'shoulder',
      'lowerBack',
      'hip',
    ]);
  });

  it('tags shoulders, elbows and wrists for push-ups and dips', () => {
    expect(joints({ name: 'Pushups' })).toEqual(['shoulder', 'elbow', 'wrist']);
    expect(joints({ name: 'Dips - Triceps Version' })).toEqual([
      'shoulder',
      'elbow',
      'wrist',
    ]);
  });

  it('tags shoulders for overhead work and elbows for arm isolation', () => {
    expect(
      joints({
        name: 'Standing Dumbbell Press',
        primaryMuscles: ['shoulders'],
      }),
    ).toEqual(['shoulder']);
    expect(
      joints({ name: 'Hammer Curls', primaryMuscles: ['biceps'] }),
    ).toEqual(['elbow']);
    expect(
      joints({
        name: 'Palms-Up Dumbbell Wrist Curl Over A Bench',
        primaryMuscles: ['forearms'],
      }),
    ).toEqual(['wrist']);
  });

  it('tags the neck and lower back for sit-ups, and the lower back for leg raises', () => {
    expect(joints({ name: 'Sit-Up', primaryMuscles: ['abdominals'] })).toEqual([
      'neck',
      'lowerBack',
    ]);
    expect(
      joints({ name: 'Flutter Kicks', primaryMuscles: ['glutes'] }),
    ).toEqual(['lowerBack']);
  });

  it('tags ankles for calf raises', () => {
    expect(
      joints({
        name: 'Standing Dumbbell Calf Raise',
        primaryMuscles: ['calves'],
      }),
    ).toEqual(['ankle']);
  });

  it('leaves gentle movements untagged', () => {
    expect(
      joints({ name: 'Dead Bug', primaryMuscles: ['abdominals'] }),
    ).toEqual([]);
    expect(
      joints({
        id: 'Walking_Treadmill',
        name: 'Walking, Treadmill',
        category: 'cardio',
      }),
    ).toEqual([]);
  });
});
