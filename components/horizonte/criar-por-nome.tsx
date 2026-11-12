/**
 * Campo + botão para criar algo que só tem nome (matéria, tópico). Valida o vazio na hora;
 * quem decide é o servidor, e o erro dele aparece embaixo do campo.
 */
import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BotaoPrincipal, CampoTexto } from '@/components/horizonte/formulario';
import type { ResultadoApi } from '@/services/api';
import { sair } from '@/services/auth';

export function CriarPorNome<T>({
  rotulo,
  placeholder,
  textoBotao,
  maxLength,
  criar,
  aoCriar,
}: {
  rotulo: string;
  placeholder: string;
  textoBotao: string;
  maxLength: number;
  criar: (nome: string) => Promise<ResultadoApi<T>>;
  aoCriar: (criado: T) => void;
}) {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const enviandoRef = useRef(false);

  const enviar = async () => {
    if (enviandoRef.current) return;
    const limpo = nome.trim();
    if (!limpo) {
      setErro('Escreva o nome antes de criar.');
      return;
    }
    enviandoRef.current = true;
    setEnviando(true);
    try {
      const r = await criar(limpo);
      if (r.ok) {
        setNome('');
        aoCriar(r.dados);
      } else if (r.status === 401) {
        await sair();
      } else {
        setErro(r.erro);
      }
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  };

  return (
    <View style={styles.coluna}>
      <CampoTexto
        rotulo={rotulo}
        placeholder={placeholder}
        value={nome}
        onChangeText={(t) => {
          setNome(t);
          setErro(null);
        }}
        erro={erro}
        maxLength={maxLength}
        autoCapitalize="sentences"
        returnKeyType="done"
        onSubmitEditing={enviar}
        editable={!enviando}
      />
      <BotaoPrincipal texto={textoBotao} textoOcupado="Criando…" ocupado={enviando} compacto aoTocar={enviar} />
    </View>
  );
}

const styles = StyleSheet.create({
  coluna: { gap: 12, marginTop: 12 },
});
