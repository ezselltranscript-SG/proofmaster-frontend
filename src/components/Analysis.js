import React from 'react';
import styled from 'styled-components';

const AnalysisContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  flex: 1;
`;

const StatsSection = styled.div`
  margin-bottom: 1.5rem;
  
  p {
    margin: 0.3rem 0;
  }
`;

const IssuesSection = styled.div`
  margin-bottom: 1.5rem;
  
  p {
    margin: 0.3rem 0;
  }
`;

const SuggestionsSection = styled.div`
  margin-bottom: 1.5rem;
`;

// Estilo base para todas las sugerencias
const SuggestionBox = styled.div`
  padding: 0.8rem;
  border-radius: 5px;
  position: relative;
  margin-bottom: 1rem;
  
  // Color por defecto (amarillo para correcciones normales)
  background: ${props => props.correctionType === 'town' ? '#e3f2fd' : '#fff9c4'};
  border-left: 5px solid ${props => props.correctionType === 'town' ? '#2196f3' : '#fbc02d'};
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 8px;
  right: 10px;
  display: flex;
  gap: 8px;
`;

const CheckMark = styled.span`
  color: green;
  font-weight: bold;
  cursor: pointer;
`;

const RejectMark = styled.span`
  color: red;
  font-weight: bold;
  cursor: pointer;
`;

const Button = styled.button`
  background-color: #2979ff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  
  &:hover {
    background-color: #1c54b2;
  }
`;

const Analysis = ({ 
  wordCount = 0, 
  charCount = 0, 
  paragraphCount = 0,
  suggestions = [],
  onFixAll,
  onAcceptSuggestion,
  onRejectSuggestion
}) => {
  return (
    <AnalysisContainer>
      <StatsSection>
        <h3>Analysis</h3>
        <p>Words: {wordCount}</p>
        <p>Characters: {charCount}</p>
        <p>Paragraphs: {paragraphCount}</p>
      </StatsSection>
      
      <IssuesSection>
        <h4>Issues Found</h4>
        <p>🧠 Spelling Issues: <span>{suggestions.length}</span></p>
        <p>❗ Missing Paragraphs: <span>0</span></p>
      </IssuesSection>
      
      {suggestions.length > 0 && (
        <Button onClick={onFixAll} style={{ marginBottom: '1rem' }}>🔧 Fix All Issues</Button>
      )}
      
      <SuggestionsSection>
        <h4>Suggestions</h4>
        {suggestions.length > 0 ? (
          <>
            {suggestions.map((suggestion, index) => (
              <SuggestionBox 
                key={index} 
                correctionType={suggestion.correction_type || 'normal'}
              >
                <p><strong>Original:</strong> <code>{suggestion.original}</code></p>
                <p><strong>Suggestion:</strong> <code>{suggestion.suggestion}</code></p>
                {suggestion.correction_type === 'town' && (
                  <p><small style={{ color: '#0d47a1' }}>Corrección de nombre de lugar</small></p>
                )}
                <ActionButtons>
                  <CheckMark 
                    title="Apply suggestion" 
                    onClick={() => onAcceptSuggestion && onAcceptSuggestion(suggestion, index)}
                  >
                    ✔
                  </CheckMark>
                  <RejectMark 
                    title="Reject suggestion" 
                    onClick={() => onRejectSuggestion && onRejectSuggestion(suggestion, index)}
                  >
                    ✕
                  </RejectMark>
                </ActionButtons>
              </SuggestionBox>
            ))}
          </>
        ) : (
          <p>No suggestions available yet. Add text to get started.</p>
        )}
      </SuggestionsSection>
    </AnalysisContainer>
  );
};

export default Analysis;
