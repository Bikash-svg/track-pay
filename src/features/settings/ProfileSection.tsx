import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Screen, Text, Button, Field, copy } from '../../ui';
import { useTheme } from '../../ui/useTheme';
import { getProfile, setProfile, type Profile } from '../../data/settings';
import { sanitizeName } from '../../domain/profile';

export function ProfileSection() {
  const { tokens } = useTheme();
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');

  useEffect(() => {
    let cancelled = false;
    getProfile().then((p) => {
      if (!cancelled) {
        setProfileState(p);
        setFirstName(p.firstName ?? '');
        setSurname(p.surname ?? '');
      }
    });
    return () => { cancelled = true; };
  }, []);

  const handleSave = useCallback(async () => {
    if (!profile) return;
    const updated: Profile = {
      ...profile,
      firstName: sanitizeName(firstName),
      surname: sanitizeName(surname),
    };
    await setProfile(updated);
    setProfileState(updated);
    setEditing(false);
  }, [profile, firstName, surname]);

  const handleCancel = useCallback(() => {
    setFirstName(profile?.firstName ?? '');
    setSurname(profile?.surname ?? '');
    setEditing(false);
  }, [profile]);

  if (profile === null) {
    return <Text>Loading…</Text>;
  }

  const displayName = [profile.firstName, profile.surname].filter(Boolean).join(' ') || 'No name set';
  const initials = (profile.firstName?.charAt(0) ?? 'T').toUpperCase();

  return (
    <View>
      <Text style={{ fontFamily: tokens.fontHeading, fontSize: 16, marginBottom: 8 }}>
        Profile
      </Text>
      {!editing ? (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: tokens.interactive,
              alignItems: 'center', justifyContent: 'center', marginRight: 12,
            }}>
              <Text style={{ fontFamily: tokens.fontHeading, fontSize: 18 }}>{initials}</Text>
            </View>
            <Text>{displayName}</Text>
          </View>
          <Button onPress={() => setEditing(true)}>Edit profile</Button>
        </View>
      ) : (
        <View>
          <Field label="First name" value={firstName} onChangeText={setFirstName} />
          <Field label="Surname" value={surname} onChangeText={setSurname} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Button onPress={handleSave}>Save</Button>
            <Button variant="secondary" onPress={handleCancel}>Cancel</Button>
          </View>
        </View>
      )}
    </View>
  );
}
