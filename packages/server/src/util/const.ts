import { EStatusEffect } from "../effects/EStatusEffect.ts"
import { StatusEffect } from "../effects/StatusEffect.ts"

import { BurnoutEffect } from "../effects/BurnoutEffect.ts"
import { MagnetEffect } from "../effects/MagnetEffect.ts"
import { KamikazeEffect } from "../effects/KamikazeEffect.ts"
import { SuperEaterEffect } from "../effects/SuperEaterEffect.ts"
import { InvincibilityEffect } from "../effects/InvincibilityEffect.ts"

export const minOrbSpawnScore = 1
export const maxOrbSpawnScore = 5

// Chance to spawn a power-up orb in percentages
export const powerupChance = 5

export const playerBurnScore = 1

export const normalPickupRadius = 25
export const magnetPickupRadius = 5000

export const normalSpeed = 350
export const sprintSpeed = 650
export const burnoutSpeed = 850

export const mapRadius = 2000

export const fpsLimit = 60
export const tickRate = 1000 / fpsLimit

type StatusEffectConstructor<T extends StatusEffect = StatusEffect> = new (...args: ConstructorParameters<typeof StatusEffect>) => T

export const statusEffects: { [k: EStatusEffect]: StatusEffectConstructor } = {
	[EStatusEffect.BURNOUT]: BurnoutEffect,
	[EStatusEffect.MAGNET]: MagnetEffect,
	[EStatusEffect.KAMIKAZE]: KamikazeEffect,
	[EStatusEffect.SUPER_EATER]: SuperEaterEffect,
	[EStatusEffect.INVINCIBILITY]: InvincibilityEffect
}
