// Utilitaire pour vérifier la structure de la base de données
import { supabase } from '../supabase/client';

export class DatabaseChecker {
  /**
   * Vérifie la structure de la table profiles
   */
  static async checkProfilesTable(): Promise<{
    exists: boolean;
    columns?: string[];
    error?: string;
  }> {
    try {
      console.log('🔍 Checking profiles table structure...');
      
      // Essayer de faire une requête simple pour vérifier l'existence
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (error) {
        console.error('❌ Profiles table check failed:', error);
        return {
          exists: false,
          error: error.message
        };
      }

      console.log('✅ Profiles table exists and is accessible');
      
      // Si on a des données, on peut voir les colonnes
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log('📋 Available columns:', columns);
        return {
          exists: true,
          columns
        };
      }

      // Table existe mais vide, on ne peut pas voir les colonnes
      return {
        exists: true,
        columns: []
      };

    } catch (error) {
      console.error('❌ Database check error:', error);
      return {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Teste la création d'un profil factice
   */
  static async testProfileCreation(): Promise<{
    success: boolean;
    error?: string;
    details?: any;
  }> {
    const testUserId = '00000000-0000-0000-0000-000000000001';
    
    try {
      console.log('🧪 Testing profile creation...');
      
      // Données de test
      const testProfile = {
        id: testUserId,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        city: 'Paris',
        golf_index: 15.5,
        dominant_hand: 'right' as const
      };

      // Essayer de créer le profil
      const { data, error } = await supabase
        .from('profiles')
        .upsert(testProfile, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('❌ Test profile creation failed:', error);
        return {
          success: false,
          error: error.message,
          details: error
        };
      }

      console.log('✅ Test profile created successfully:', data);

      // Nettoyer le profil de test
      await supabase.from('profiles').delete().eq('id', testUserId);
      console.log('🧹 Test profile cleaned up');

      return {
        success: true,
        details: data
      };

    } catch (error) {
      console.error('❌ Test profile creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Vérifie les permissions RLS
   */
  static async checkRLSPermissions(): Promise<{
    canSelect: boolean;
    canInsert: boolean;
    canUpdate: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let canSelect = false;
    let canInsert = false;
    let canUpdate = false;

    try {
      console.log('🔐 Checking RLS permissions...');

      // Test SELECT
      try {
        await supabase.from('profiles').select('id').limit(1);
        canSelect = true;
        console.log('✅ SELECT permission OK');
      } catch (error) {
        errors.push(`SELECT failed: ${error}`);
        console.log('❌ SELECT permission failed');
      }

      // Test INSERT (avec un ID factice)
      const testId = '00000000-0000-0000-0000-000000000002';
      try {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: testId,
            email: 'rls-test@example.com',
            first_name: 'RLS',
            last_name: 'Test',
            city: 'Test City'
          });

        if (!error) {
          canInsert = true;
          console.log('✅ INSERT permission OK');
          // Nettoyer
          await supabase.from('profiles').delete().eq('id', testId);
        } else {
          errors.push(`INSERT failed: ${error.message}`);
          console.log('❌ INSERT permission failed:', error.message);
        }
      } catch (error) {
        errors.push(`INSERT failed: ${error}`);
        console.log('❌ INSERT permission failed');
      }

      // Test UPDATE
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ city: 'Updated City' })
          .eq('id', 'non-existent-id');

        // Même si aucune ligne n'est affectée, l'absence d'erreur indique que la permission existe
        if (!error) {
          canUpdate = true;
          console.log('✅ UPDATE permission OK');
        } else {
          errors.push(`UPDATE failed: ${error.message}`);
          console.log('❌ UPDATE permission failed:', error.message);
        }
      } catch (error) {
        errors.push(`UPDATE failed: ${error}`);
        console.log('❌ UPDATE permission failed');
      }

    } catch (error) {
      errors.push(`RLS check failed: ${error}`);
    }

    return {
      canSelect,
      canInsert,
      canUpdate,
      errors
    };
  }

  /**
   * Exécute tous les tests de diagnostic
   */
  static async runFullDiagnostic(): Promise<{
    tableCheck: any;
    creationTest: any;
    permissionsCheck: any;
    summary: string;
  }> {
    console.log('🏥 Running full database diagnostic...');

    const tableCheck = await this.checkProfilesTable();
    const creationTest = await this.testProfileCreation();
    const permissionsCheck = await this.checkRLSPermissions();

    let summary = '📊 Diagnostic Summary:\n';
    summary += `- Table exists: ${tableCheck.exists ? '✅' : '❌'}\n`;
    summary += `- Profile creation: ${creationTest.success ? '✅' : '❌'}\n`;
    summary += `- SELECT permission: ${permissionsCheck.canSelect ? '✅' : '❌'}\n`;
    summary += `- INSERT permission: ${permissionsCheck.canInsert ? '✅' : '❌'}\n`;
    summary += `- UPDATE permission: ${permissionsCheck.canUpdate ? '✅' : '❌'}\n`;

    if (tableCheck.columns && tableCheck.columns.length > 0) {
      summary += `- Available columns: ${tableCheck.columns.join(', ')}\n`;
    }

    console.log(summary);

    return {
      tableCheck,
      creationTest,
      permissionsCheck,
      summary
    };
  }
}