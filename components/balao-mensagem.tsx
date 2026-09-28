import { StyleSheet, Text, View } from 'react-native';
import { Night } from '@/constants/theme';
import type { ChatApiAuthor } from '@/types/aluma';

export function MessageBubble({ author, text }: { author: ChatApiAuthor; text: string }) {
  const isStudent = author === 'aluno';
  return (
    <View style={[styles.bubble, isStudent ? styles.studentBubble : styles.tutorBubble]}>
      <Text style={[styles.text, isStudent && styles.studentText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    // A lista é uma coluna: o horizontal é o eixo cruzado, então alignSelf move um balão só.
    // justifyContent moveria todos juntos.
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
  },
  tutorBubble: {
    // Ciano: a voz do tutor.
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    shadowColor: Night.guide,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
  },
  studentBubble: {
    // Âmbar: a ação do aluno.
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
    backgroundColor: Night.spark,
  },
  text: {
    // Sem flexShrink o texto longo vaza da tela em vez de quebrar a linha.
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Night.starlight,
  },
  studentText: {
    color: Night.sky,
    fontWeight: '500',
  },
});
