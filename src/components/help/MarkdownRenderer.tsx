import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Parser markdown amélioré pour gérer le texte inline
  const parseInlineMarkdown = (text: string): JSX.Element[] => {
    const parts: JSX.Element[] = [];
    let currentIndex = 0;
    
    // Regex pour trouver le texte en gras **texte**
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let matchIndex = 0;
    
    // Reset regex lastIndex pour éviter les problèmes
    boldRegex.lastIndex = 0;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Ajouter le texte avant le gras
      if (match.index > currentIndex) {
        const textBefore = text.substring(currentIndex, match.index);
        if (textBefore) {
          parts.push(
            <Text key={`text-${matchIndex}-${currentIndex}`} style={styles.inlineText}>
              {textBefore}
            </Text>
          );
        }
      }
      
      // Ajouter le texte en gras
      parts.push(
        <Text key={`bold-${matchIndex}-${match.index}`} style={styles.inlineBold}>
          {match[1]}
        </Text>
      );
      
      currentIndex = match.index + match[0].length;
      matchIndex++;
    }
    
    // Ajouter le texte restant
    if (currentIndex < text.length) {
      const remainingText = text.substring(currentIndex);
      if (remainingText) {
        parts.push(
          <Text key={`text-final-${currentIndex}`} style={styles.inlineText}>
            {remainingText}
          </Text>
        );
      }
    }
    
    // Si aucun markdown trouvé, retourner le texte simple
    if (parts.length === 0) {
      parts.push(
        <Text key="simple-text" style={styles.inlineText}>
          {text}
        </Text>
      );
    }
    
    return parts;
  };

  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        elements.push(
          <Text key={index} style={styles.h1}>
            {line.substring(2)}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <Text key={index} style={styles.h2}>
            {line.substring(3)}
          </Text>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <Text key={index} style={styles.h3}>
            {line.substring(4)}
          </Text>
        );
      } else if (line.startsWith('- ')) {
        const listContent = line.substring(2);
        elements.push(
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              {parseInlineMarkdown(listContent)}
            </Text>
          </View>
        );
      } else if (line.trim() === '') {
        elements.push(<View key={index} style={styles.spacing} />);
      } else {
        // Paragraphe normal avec support du markdown inline
        elements.push(
          <Text key={index} style={styles.paragraph}>
            {parseInlineMarkdown(line)}
          </Text>
        );
      }
    });
    
    return elements;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {parseMarkdown(content)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    marginTop: 8,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    marginTop: 16,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 8,
  },
  inlineText: {
    fontSize: 16,
    color: '#4b5563',
  },
  inlineBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 16,
  },
  bullet: {
    fontSize: 16,
    color: '#3b82f6',
    marginRight: 8,
    fontWeight: 'bold',
  },
  listText: {
    fontSize: 16,
    color: '#4b5563',
    flex: 1,
    lineHeight: 24,
  },
  spacing: {
    height: 12,
  },
});