/**
 * Vide toutes les données locales liées à l'utilisateur connecté.
 * À appeler au logout pour que le prochain compte ne voie pas les séances d'un autre.
 */
import { clearAllMutations } from './mutation-queue';
import { clearSyncState } from './sync-state';
import { clearUserProfile } from './user-profile';
import { clearAll } from './workouts-repository';

export const clearAllUserDataForLogout = async (): Promise<void> => {
  await Promise.all([
    clearAll(),
    clearSyncState(),
    clearAllMutations(),
    clearUserProfile(),
  ]);
};
