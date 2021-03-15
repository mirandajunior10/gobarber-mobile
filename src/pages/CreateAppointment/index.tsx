import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,
  ProviderListContainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
} from './styles';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

interface RouteParams {
  providerId: string;
}
export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}
export interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [providers, setProviders] = useState<Provider[]>([]);
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const { user } = useAuth();
  const route = useRoute();
  const { goBack } = useNavigation();

  const routeParams = route.params as RouteParams;
  const [selectedProvider, setSelectedProvider] = useState(
    routeParams.providerId,
  );

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker(state => !state);
  }, []);

  const handleDateChanged = useCallback(
    (event: Event, date: Date | undefined) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
      date && setSelectedDate(date);
    },
    [],
  );

  useEffect(() => {
    api.get<Provider[]>('providers').then(response => {
      setProviders(response.data);
    });
  }, []);
  useEffect(() => {
    api
      .get<AvailabilityItem[]>(
        `providers/${selectedProvider}/day-availability`,
        {
          params: {
            year: selectedDate.getUTCFullYear(),
            month: selectedDate.getMonth() + 1,
            day: selectedDate.getDate(),
          },
        },
      )
      .then(response => {
        setAvailability(response.data);
      });
  }, [selectedProvider, selectedDate]);

  return (
    <Container>
      <Header>
        <BackButton onPress={goBack}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>
        <HeaderTitle>Cabeleireiros</HeaderTitle>
        <UserAvatar source={{ uri: user.avatar_url }} />
      </Header>
      <ProviderListContainer>
        <ProvidersList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={providers}
          keyExtractor={provider => provider.id}
          renderItem={({ item: provider }) => (
            <ProviderContainer
              onPress={() => handleSelectProvider(provider.id)}
              selected={provider.id === selectedProvider}
            >
              {provider.avatar_url ? (
                <ProviderAvatar source={{ uri: provider.avatar_url }} />
              ) : (
                <Icon
                  size={32}
                  name="user"
                  color={
                    provider.id === selectedProvider ? '#232129' : '#f4ede8'
                  }
                />
              )}
              <ProviderName selected={provider.id === selectedProvider}>
                {provider.name}
              </ProviderName>
            </ProviderContainer>
          )}
        />
      </ProviderListContainer>
      <Calendar>
        <Title>Escolha a data</Title>
        <OpenDatePickerButton onPress={handleToggleDatePicker}>
          <OpenDatePickerButtonText>
            Selecionar outra data
          </OpenDatePickerButtonText>
        </OpenDatePickerButton>
        {showDatePicker && (
          <DateTimePicker
            mode="date"
            display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
            onChange={handleDateChanged}
            {...(Platform.OS === 'ios' && { textColor: '#f4ede8' })}
            value={selectedDate}
          />
        )}
      </Calendar>
    </Container>
  );
};

export default CreateAppointment;
