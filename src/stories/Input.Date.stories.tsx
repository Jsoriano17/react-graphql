// require('dotenv').config();
import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

//Pull in our Input component instead
import Input from '../components/shared/Input';
import { Pressable, View } from 'react-native';
import { useReactGraphql } from '../hooks/useReactGraphql';
import HasuraConfig from '../../tests/TestHasuraConfig';
// import { createClient, Provider as UrqlProvider } from 'urql';

const hasuraUrl = process.env.STORYBOOK_HASURA_URL;

export default {
  title: 'Inputs/DatePicker',
  component: Input.DatePicker,
  decorators: [],
} as ComponentMeta<typeof Input.DatePicker>;


export const Form: ComponentStory<typeof Input.DatePicker> = () => {
  const dataApi = useReactGraphql(HasuraConfig.posts);
  const mutationState = dataApi.useInsert({});

  return (
    <View>
      <Input.DatePicker />
    </View>
  );
};
