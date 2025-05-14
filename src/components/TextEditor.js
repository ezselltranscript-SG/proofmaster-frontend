import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const EditorContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  flex: 2;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #666;
`;

const EditorWrapper = styled.div`
  width: 100%;
  height: 300px;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  overflow-y: auto;
  font-family: 'Segoe UI', sans-serif;
  white-space: pre-wrap;
  word-break: break-word;
  background-color: white;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 300px;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  resize: none;
  font-family: 'Segoe UI', sans-serif;
`;

const HighlightedText = styled.div`
  width: 100%;
  height: 100%;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
`;

const HighlightedWord = styled.span`
  background-color: #ffeb3b;
  padding: 2px 0;
  border-radius: 2px;
  font-weight: 500;
`;

const Tools = styled.div`
  display: flex;
  gap: 0.5rem;
  cursor: pointer;
`;

const ToolIcon = styled.span`
  font-size: 1.2rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: #2979ff;
  }
`;

const TextEditor = ({ text, setText, highlightWords = [] }) => {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [paragraphCount, setParagraphCount] = useState(0);

  useEffect(() => {
    // Calculate text statistics
    if (text) {
      setWordCount(text.split(/\s+/).filter(word => word !== '').length);
      setCharCount(text.length);
      setParagraphCount(text.split(/\n+/).filter(para => para !== '').length);
    } else {
      setWordCount(0);
      setCharCount(0);
      setParagraphCount(0);
    }
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    alert('Text copied to clipboard!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear the editor?')) {
      setText('');
    }
  };

  // Función para resaltar palabras en el texto
  const renderHighlightedText = () => {
    if (!text || highlightWords.length === 0) {
      return text;
    }

    // Enfoque simplificado: procesar una palabra a la vez
    
    // Crear un mapa de posiciones para todas las palabras a resaltar
    let allMatches = [];
    
    // Procesar cada palabra a resaltar
    highlightWords.forEach(word => {
      // Escapar caracteres especiales en la palabra para la expresión regular
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Crear una expresión regular para esta palabra específica
      let wordRegex;
      
      // Para caracteres especiales como &, + o símbolos, no usamos límites de palabra
      if (/^[^\w\s]$/.test(word) || word === '&' || word === '+' || word.includes('°') || word.includes('.')) {
        wordRegex = new RegExp(escapedWord, 'gi');
      } else {
        // Para palabras normales, usamos límites de palabra
        wordRegex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
      }
      
      // Reiniciar lastIndex para buscar desde el principio
      wordRegex.lastIndex = 0;
      
      // Buscar todas las coincidencias en el texto
      let match;
      while ((match = wordRegex.exec(text)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          word: match[0]
        });
      }
    });
    
    // Ordenar todas las coincidencias por posición de inicio
    allMatches.sort((a, b) => a.start - b.start);
    
    // Eliminar superposiciones (si una palabra está dentro de otra)
    const filteredMatches = [];
    for (let i = 0; i < allMatches.length; i++) {
      const current = allMatches[i];
      let overlap = false;
      
      for (let j = 0; j < filteredMatches.length; j++) {
        const existing = filteredMatches[j];
        
        // Verificar si hay superposición
        if (current.start >= existing.start && current.end <= existing.end) {
          overlap = true;
          break;
        }
      }
      
      if (!overlap) {
        filteredMatches.push(current);
      }
    }
    
    // Construir el resultado con las palabras resaltadas
    let lastPos = 0;
    let resultElements = [];
    
    filteredMatches.forEach((match, index) => {
      // Añadir el texto antes de la coincidencia
      if (match.start > lastPos) {
        resultElements.push(text.substring(lastPos, match.start));
      }
      
      // Añadir la palabra resaltada
      resultElements.push(
        <HighlightedWord key={index}>
          {match.word}
        </HighlightedWord>
      );
      
      lastPos = match.end;
    });
    
    // Añadir el texto restante después de la última coincidencia
    if (lastPos < text.length) {
      resultElements.push(text.substring(lastPos));
    }
    
    return resultElements;
  };

  return (
    <EditorContainer>
      <EditorHeader>
        <h2>Letter Body Spellchecker</h2>
        <Tools>
          <ToolIcon onClick={handleReset} title="Reset">🔄</ToolIcon>
          <ToolIcon onClick={handleCopy} title="Copy to clipboard">📋</ToolIcon>
        </Tools>
      </EditorHeader>
      
      {highlightWords.length > 0 ? (
        // Mostrar texto con palabras resaltadas cuando hay palabras para resaltar
        <EditorWrapper>
          <HighlightedText>
            {renderHighlightedText()}
          </HighlightedText>
        </EditorWrapper>
      ) : (
        // Mostrar textarea normal cuando no hay palabras para resaltar
        <TextArea 
          placeholder="Paste your text here..." 
          value={text} 
          onChange={(e) => setText(e.target.value)}
        />
      )}
    </EditorContainer>
  );
};

export default TextEditor;
