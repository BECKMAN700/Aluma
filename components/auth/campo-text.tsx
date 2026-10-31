import React, { useMemo, useState } from 'react';
/**
 * Campo de formulário com rótulo visível, mensagem de erro e leitura para leitor de tela.
 */

import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useCoresAuth } from '@/constants/auth-theme';
import { IconeOlho } from '@/components/auth/icone-olho';

interface CampoTextoProps extends Omit<TextInputProps, 'style'> {
  rotulo: string;
  erro?: string | null;
  /** Mostra o olho para exibir/ocultar a senha e controla secureTextEntry. */
  senha?: boolean;
  inputRef?: React.Ref<TextInput>;
}

export function CampoTexto({ rotulo, erro, senha = false, inputRef, ...props }: CampoTextoProps) {
  const c = useCoresAuth();
  const [visivel, setVisivel] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        campo: { width: '100%', gap: 6 },
        rotulo: { fontSize: 14, fontWeight: '600', color: c.texto },
        // A caixa desenha a borda; o input e o olho são irmãos na mesma row (nada absoluto).
        caixa: {
          width: '100%',
          minHeight: 48,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: c.borda,
          backgroundColor: c.cartao,
          borderRadius: 10,
        },
        caixaErro: { borderColor: c.erro },
        input: {
          flex: 1,
          minWidth: 0,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
          color: c.texto,
        },
        olho: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 12,
          paddingVertical: 12,
        },
        erro: { flexShrink: 1, fontSize: 13, color: c.erro },
      }),
    [c],
  );

  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={[styles.caixa, !!erro && styles.caixaErro]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholderTextColor={c.placeholder}
          accessibilityLabel={rotulo}
          accessibilityHint={erro ?? undefined}
          secureTextEntry={senha && !visivel}
          autoCapitalize="none"
          {...props}
        />
        {senha && (
          <Pressable
            style={styles.olho}
            onPress={() => setVisivel((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
            accessibilityState={{ checked: visivel }}
          >
            <IconeOlho aberto={visivel} cor={c.textoSuave} />
          </Pressable>
        )}
      </View>
      {!!erro && (
        <Text style={styles.erro} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {erro}
        </Text>
      )}
    </View>
  );
}
