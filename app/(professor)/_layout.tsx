/**
 * Layout do grupo do professor. As telas de turmas e alunos chegam com a #100.
 */
import { Stack } from 'expo-router';
import { Night } from '@/constants/theme';

export default function ProfessorLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Night.sky } }} />;
}
