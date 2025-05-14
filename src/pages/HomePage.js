import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Header from '../components/Header';
import TextEditor from '../components/TextEditor';
import Analysis from '../components/Analysis';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import { FaClipboard, FaSync, FaFileWord } from 'react-icons/fa';
import mammoth from 'mammoth';
import { spellcheckService } from '../services/api';

const Main = styled.main`
  padding: 2rem 3rem;
`;

const EditorSection = styled.section`
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HomePage = () => {
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [correctedText, setCorrectedText] = useState('');
  const [notification, setNotification] = useState(null);
  const [highlightWords, setHighlightWords] = useState([]);
  const fileInputRef = useRef(null);

  // Calcular estadísticas del texto
  const calculateStats = (text) => {
    if (text) {
      setWordCount(text.split(/\s+/).filter(word => word !== '').length);
      setCharCount(text.length);
      setParagraphCount(text.split(/\n+/).filter(para => para !== '').length);
    } else {
      setWordCount(0);
      setCharCount(0);
      setParagraphCount(0);
    }
  };

  // Manejar cambios en el texto
  const handleTextChange = (newText) => {
    setText(newText);
    calculateStats(newText);
  };

  // Analizar el texto
  const analyzeText = async () => {
    if (!text.trim()) {
      setNotification({
        type: 'warning',
        message: 'Please enter some text to analyze'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await spellcheckService.checkText(text);
      setSuggestions(result.suggestions);
      setCorrectedText(result.corrected_text);
      
      // Extraer las palabras originales para resaltarlas
      const wordsToHighlight = result.suggestions.map(sugg => sugg.original);
      setHighlightWords(wordsToHighlight);
      
      if (result.suggestions.length > 0) {
        setNotification({
          type: 'info',
          message: `Found ${result.suggestions.length} suggestions for improvement`
        });
      } else {
        setNotification({
          type: 'success',
          message: 'No issues found in your text!'
        });
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
      setNotification({
        type: 'error',
        message: 'Error analyzing text. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar todas las correcciones
  const handleFixAll = () => {
    if (correctedText) {
      setText(correctedText);
      calculateStats(correctedText);
      setSuggestions([]);
      setHighlightWords([]); // Limpiar palabras resaltadas
      setNotification({
        type: 'success',
        message: 'All suggestions have been applied!'
      });
    }
  };

  // Aceptar una sugerencia individual
  const handleAcceptSuggestion = (suggestion, index) => {
    // Crear una copia del texto actual
    let newText = text;
    
    // Reemplazar la palabra original por la sugerencia
    // Necesitamos manejar caracteres especiales de manera diferente
    const original = suggestion.original;
    
    // Escapar caracteres especiales en la palabra para la expresión regular
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    let regex;
    // Para caracteres especiales como &, + o símbolos, no usamos límites de palabra
    if (/^[^\w\s]$/.test(original) || original === '&' || original === '+' || original.includes('°') || original.includes('.')) {
      regex = new RegExp(escapedOriginal, 'g');
    } else {
      // Para palabras normales, usamos límites de palabra
      regex = new RegExp(`\\b${escapedOriginal}\\b`, 'g');
    }
    
    newText = newText.replace(regex, suggestion.suggestion);
    
    // Actualizar el texto y las estadísticas
    setText(newText);
    calculateStats(newText);
    
    // Eliminar la sugerencia aceptada de la lista
    const newSuggestions = [...suggestions];
    newSuggestions.splice(index, 1);
    setSuggestions(newSuggestions);
    
    // Actualizar las palabras a resaltar
    const newHighlightWords = newSuggestions.map(s => s.original);
    setHighlightWords(newHighlightWords);
    
    // Mostrar notificación
    setNotification({
      type: 'success',
      message: `Applied suggestion: ${suggestion.original} → ${suggestion.suggestion}`
    });
  };
  
  // Rechazar una sugerencia individual
  const handleRejectSuggestion = (suggestion, index) => {
    // Eliminar la sugerencia rechazada de la lista
    const newSuggestions = [...suggestions];
    newSuggestions.splice(index, 1);
    setSuggestions(newSuggestions);
    
    // Actualizar las palabras a resaltar
    const newHighlightWords = newSuggestions.map(s => s.original);
    setHighlightWords(newHighlightWords);
    
    // Mostrar notificación
    setNotification({
      type: 'info',
      message: `Rejected suggestion: ${suggestion.original} → ${suggestion.suggestion}`
    });
  };
  
  // Cerrar notificación
  const handleCloseNotification = () => {
    setNotification(null);
  };
  
  // Función para cargar archivo Word
  const handleLoadWordFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verificar que sea un archivo Word
    if (!file.name.endsWith('.docx')) {
      setNotification({
        type: 'error',
        message: 'Please select a valid Word (.docx) file'
      });
      return;
    }
    
    setLoading(true);
    
    // Leer el archivo como ArrayBuffer
    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      try {
        // Convertir el archivo Word a HTML usando mammoth
        const arrayBuffer = loadEvent.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        
        // Establecer el texto extraído
        setText(result.value);
        calculateStats(result.value);
        
        // Limpiar sugerencias y palabras resaltadas
        setSuggestions([]);
        setHighlightWords([]);
        
        setNotification({
          type: 'success',
          message: 'Word document loaded successfully!'
        });
      } catch (error) {
        console.error('Error loading Word file:', error);
        setNotification({
          type: 'error',
          message: 'Error loading Word file. Please try again.'
        });
      } finally {
        setLoading(false);
        // Limpiar el input de archivo para permitir cargar el mismo archivo nuevamente
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      setLoading(false);
      setNotification({
        type: 'error',
        message: 'Error reading the file. Please try again.'
      });
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  // Función para activar el input de archivo
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <Header />
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={handleCloseNotification}
        />
      )}
      <Main>
        <EditorSection>
          <TextEditor 
            text={text} 
            setText={handleTextChange}
            highlightWords={highlightWords}
          />
          <Analysis 
            wordCount={wordCount}
            charCount={charCount}
            paragraphCount={paragraphCount}
            suggestions={suggestions}
            onFixAll={handleFixAll}
            onAcceptSuggestion={handleAcceptSuggestion}
            onRejectSuggestion={handleRejectSuggestion}
          />
        </EditorSection>
        <div style={{ marginTop: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {/* Botón para cargar archivo Word */}
          <button 
            onClick={triggerFileInput} 
            disabled={loading}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <FaFileWord size="1.2em" />
            Load Word File
          </button>
          
          {/* Input de archivo oculto */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLoadWordFile} 
            accept=".docx" 
            style={{ display: 'none' }} 
          />
          
          {/* Botón para analizar texto */}
          <button 
            onClick={analyzeText} 
            disabled={loading || !text.trim()}
            style={{
              backgroundColor: '#2979ff',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '5px',
              cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !text.trim() ? 0.7 : 1,
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {loading && <LoadingSpinner size="20px" />}
            <FaSync size="1.2em" />
            {loading ? 'Analyzing...' : 'Analyze Text'}
          </button>
          
          {/* Se eliminó el botón de Copy to Clipboard */}
        </div>
      </Main>
      <Footer />
    </>
  );
};

export default HomePage;
