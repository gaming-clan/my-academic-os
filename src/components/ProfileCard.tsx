import { useState, useEffect } from 'react';
import { User, GraduationCap, Hash, Users, Edit2, Check, X, ShieldAlert, BookOpen } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Profile } from '../types';

interface ProfileCardProps {
  userId: string | null;
}

const DEFAULT_PROFILE: Profile = {
  userId: 'local-user',
  name: 'John Doe',
  academicLevel: 'University',
  program: 'Modern Technologies',
  studentId: '63887',
  group: '3988AGG'
};

export default function ProfileCard({ userId }: ProfileCardProps) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(DEFAULT_PROFILE.name);
  const [editedAcademicLevel, setEditedAcademicLevel] = useState<'University' | 'High School'>('University');
  const [editedProgram, setEditedProgram] = useState(DEFAULT_PROFILE.program || '');
  const [editedStudentId, setEditedStudentId] = useState(DEFAULT_PROFILE.studentId || '');
  const [editedGroup, setEditedGroup] = useState(DEFAULT_PROFILE.group || '');
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      if (!userId) {
        // Load from LocalStorage
        const cached = localStorage.getItem('academic_os_profile');
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
          } catch (e) {
            setProfile(DEFAULT_PROFILE);
          }
        } else {
          setProfile(DEFAULT_PROFILE);
        }
        return;
      }

      setIsLoading(true);
      try {
        const docRef = doc(db, 'profiles', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as Profile);
        } else {
          // If no cloud profile exists, write the local one or the default one
          const cached = localStorage.getItem('academic_os_profile');
          const initialProfile = cached ? JSON.parse(cached) : { ...DEFAULT_PROFILE, userId };
          await setDoc(docRef, initialProfile);
          setProfile(initialProfile);
        }
      } catch (error) {
        console.error('Failed to load profile from Firestore:', error);
        // Fallback to local
        const cached = localStorage.getItem('academic_os_profile');
        if (cached) {
          setProfile(JSON.parse(cached));
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  // Set edited values when profile changes or edit is clicked
  const handleStartEdit = () => {
    setEditedName(profile.name);
    setEditedAcademicLevel(profile.academicLevel || 'University');
    setEditedProgram(profile.program || '');
    setEditedStudentId(profile.studentId || '');
    setEditedGroup(profile.group || '');
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedName.trim()) {
      setSaveError('Name is required.');
      return;
    }

    const updatedProfile: Profile = {
      userId: userId || 'local-user',
      name: editedName,
      academicLevel: editedAcademicLevel,
      program: editedProgram,
      studentId: editedStudentId,
      group: editedGroup,
      updatedAt: new Date().toISOString()
    };

    setIsLoading(true);
    setSaveError(null);

    try {
      if (userId) {
        const path = `profiles/${userId}`;
        try {
          await setDoc(doc(db, 'profiles', userId), updatedProfile);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
      
      // Always cache locally as well
      localStorage.setItem('academic_os_profile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setSaveError('Failed to save profile. Please check validation limits.');
    } finally {
      setIsLoading(false);
    }
  };

  const isHighSchool = profile.academicLevel === 'High School';

  return (
    <div id="profile-card" className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm relative flex flex-col justify-between min-h-[14rem] h-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          {isHighSchool ? 'Student Profile (High School)' : 'Student Profile (University)'}
        </span>
        {!isEditing && (
          <button
            onClick={handleStartEdit}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3 flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-mono text-zinc-400">Name</label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                maxLength={100}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] uppercase font-mono text-zinc-400">Academic Level</label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setEditedAcademicLevel('University')}
                  className={`flex-1 py-1 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    editedAcademicLevel === 'University'
                      ? 'bg-emerald-600 text-white border-transparent'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  University
                </button>
                <button
                  type="button"
                  onClick={() => setEditedAcademicLevel('High School')}
                  className={`flex-1 py-1 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    editedAcademicLevel === 'High School'
                      ? 'bg-emerald-600 text-white border-transparent'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  High School
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400">
                {editedAcademicLevel === 'High School' ? 'Grade / Year Level' : 'Program / Major'}
              </label>
              <input
                type="text"
                value={editedProgram}
                onChange={(e) => setEditedProgram(e.target.value)}
                maxLength={150}
                placeholder={editedAcademicLevel === 'High School' ? 'e.g. 11th Grade' : 'e.g. Modern Technologies'}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400">
                {editedAcademicLevel === 'High School' ? 'Student ID / Roll No' : 'Student ID'}
              </label>
              <input
                type="text"
                value={editedStudentId}
                onChange={(e) => setEditedStudentId(e.target.value)}
                maxLength={50}
                placeholder={editedAcademicLevel === 'High School' ? 'e.g. Roll 24' : 'e.g. 63887'}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-mono text-zinc-400">
                {editedAcademicLevel === 'High School' ? 'Class / Homeroom' : 'Study Group / Cohort'}
              </label>
              <input
                type="text"
                value={editedGroup}
                onChange={(e) => setEditedGroup(e.target.value)}
                maxLength={50}
                placeholder={editedAcademicLevel === 'High School' ? 'e.g. Homeroom 3B' : 'e.g. 3988AGG'}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {saveError && (
            <div className="text-[10px] text-red-500 flex items-center gap-1 font-mono">
              <ShieldAlert className="w-3 h-3" />
              {saveError}
            </div>
          )}

          <div className="flex justify-end gap-1.5 mt-1">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-2.5 py-1 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 transition-all flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </form>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold uppercase font-sans">
              {profile.name ? profile.name.slice(0, 2) : 'ST'}
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
                {profile.name}
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                {isHighSchool ? 'Secondary Education' : 'Higher Education'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-zinc-100 dark:border-zinc-900 pt-3 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-zinc-400" />
              <div className="truncate">
                <p className="text-[10px] text-zinc-400 font-mono leading-none">
                  {isHighSchool ? 'GRADE LEVEL' : 'PROGRAM'}
                </p>
                <p className="font-medium text-zinc-700 dark:text-zinc-300 truncate mt-0.5" title={profile.program}>
                  {profile.program || 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-zinc-400" />
              <div>
                <p className="text-[10px] text-zinc-400 font-mono leading-none">
                  {isHighSchool ? 'STUDENT ID / ROLL' : 'STUDENT ID'}
                </p>
                <p className="font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">
                  {profile.studentId || 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <Users className="w-4 h-4 text-zinc-400" />
              <div>
                <p className="text-[10px] text-zinc-400 font-mono leading-none">
                  {isHighSchool ? 'CLASS / HOMEROOM' : 'STUDY GROUP'}
                </p>
                <p className="font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">
                  {profile.group || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
