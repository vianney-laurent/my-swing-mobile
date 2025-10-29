import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MarkdownRenderer from '../components/help/MarkdownRenderer';
import { HelpContentService } from '../lib/help/help-content-service';
import { HelpScreen as HelpScreenType } from '../hooks/useHelpNavigation';

interface HelpScreenProps {
    helpScreen: HelpScreenType;
    onBack: () => void;
    onNavigateToSection?: (section: string) => void;
}

export default function HelpScreen({ helpScreen, onBack, onNavigateToSection }: HelpScreenProps) {
    const content = HelpContentService.getHelpContent(helpScreen);
    const isIndexScreen = helpScreen === 'helpIndex';

    const getScreenTitle = (screen: HelpScreenType): string => {
        const titles: Record<HelpScreenType, string> = {
            home: 'Aide - Accueil',
            camera: 'Aide - Enregistrement',
            analysis: 'Aide - Analyse',
            history: 'Aide - Historique',
            profile: 'Aide - Profil',
            auth: 'Aide - Connexion',
            analysisResult: 'Aide - Résultats',
            helpIndex: 'Centre d\'aide'
        };
        return titles[screen];
    };

    if (isIndexScreen) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{getScreenTitle(helpScreen)}</Text>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.welcomeTitle}>Centre d'aide My Swing</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Trouvez rapidement les réponses à vos questions
                    </Text>

                    <View style={styles.sectionsContainer}>
                        <Text style={styles.sectionTitle}>Aide par écran</Text>
                        {HelpContentService.getAllHelpSections().map((section) => (
                            <TouchableOpacity
                                key={section.key}
                                style={styles.sectionItem}
                                onPress={() => onNavigateToSection?.(section.key)}
                            >
                                <View style={styles.sectionContent}>
                                    <Text style={styles.sectionItemTitle}>{section.title}</Text>
                                    <Text style={styles.sectionItemDescription}>{section.description}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.supportSection}>
                        <Text style={styles.sectionTitle}>Support technique</Text>
                        <View style={styles.supportItem}>
                            <Ionicons name="mail" size={20} color="#3b82f6" />
                            <View style={styles.supportContent}>
                                <Text style={styles.supportTitle}>Nous contacter</Text>
                                <Text style={styles.supportDescription}>contact@myswing.app</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.title}>{getScreenTitle(helpScreen)}</Text>
                <View style={styles.placeholder} />
            </View>

            <MarkdownRenderer content={content} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 32,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 32,
    },
    sectionsContainer: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
    },
    sectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionContent: {
        flex: 1,
    },
    sectionItemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1e293b',
        marginBottom: 4,
    },
    sectionItemDescription: {
        fontSize: 14,
        color: '#64748b',
    },
    supportSection: {
        marginTop: 16,
    },
    supportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    supportContent: {
        marginLeft: 12,
    },
    supportTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1e293b',
        marginBottom: 2,
    },
    supportDescription: {
        fontSize: 14,
        color: '#64748b',
    },
});