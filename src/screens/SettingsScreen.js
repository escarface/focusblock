// FocusBlocks Settings Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { Toggle, SymbolIcon } from '../components';

export default function SettingsScreen({ navigation }) {
  const { colors, spacing } = useTheme();
  const { settings, updateSettings } = useApp();
  const insets = useSafeAreaInsets();

  const handleToggleSetting = async (key) => {
    await updateSettings({ [key]: !settings[key] });
  };

  const SettingRow = ({ icon, title, subtitle, value, onToggle, onPress }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !onToggle}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.backgroundSecondary }]}>
        <SymbolIcon name={icon} color={colors.textSecondary} size={20} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {onToggle !== undefined ? (
        <Toggle value={value} onValueChange={onToggle} />
      ) : onPress ? (
        <SymbolIcon name="chevron-right" color={colors.textMuted} size={20} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.screenHorizontal,
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.xxxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* General Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            General
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="bell"
              title="Notifications"
              subtitle="Block completion alerts"
              value={settings.notifications}
              onToggle={() => handleToggleSetting('notifications')}
            />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <SettingRow
              icon="moon"
              title="Dark Mode"
              value={settings.darkMode}
              onToggle={() => handleToggleSetting('darkMode')}
            />
          </View>
        </View>

        {/* Focus Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Focus
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="skip"
              title="Auto-start Next"
              subtitle="Automatically start next block"
              value={settings.autoStartNext}
              onToggle={() => handleToggleSetting('autoStartNext')}
            />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                Alert.prompt(
                  'Daily Goal',
                  'Set your daily focus goal in minutes',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Save',
                      onPress: (value) => {
                        const mins = parseInt(value, 10);
                        if (mins >= 1 && mins <= 720) {
                          updateSettings({ dailyGoal: mins });
                        }
                      },
                    },
                  ],
                  'plain-text',
                  String(settings.dailyGoal)
                );
              }}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.backgroundSecondary }]}>
                <SymbolIcon name="timer" color={colors.textSecondary} size={20} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Daily Goal
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  {Math.floor(settings.dailyGoal / 60)}h {settings.dailyGoal % 60}m
                </Text>
              </View>
              <SymbolIcon name="chevron-right" color={colors.textMuted} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Profile
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="user"
              title="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
            />
          </View>
        </View>

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          FocusBlocks v1.0.0 (Build 1001)
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 70,
  },
  versionText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
  },
});
