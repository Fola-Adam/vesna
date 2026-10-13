'use client'
import { useMembership } from '@/components/MemberProvider'
/** Authenticated account records only; there is no guest write fallback. */
export function useShortlist() { return useMembership() }
