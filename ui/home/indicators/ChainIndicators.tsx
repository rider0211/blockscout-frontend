import { Box, Flex, Icon, Skeleton, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import type { HomeStats } from 'types/api/stats';
import { QueryKeys } from 'types/client/queries';

import appConfig from 'configs/app/config';
import infoIcon from 'icons/info.svg';
import useFetch from 'lib/hooks/useFetch';

import ChainIndicatorChartContainer from './ChainIndicatorChartContainer';
import ChainIndicatorItem from './ChainIndicatorItem';
import useFetchChartData from './useFetchChartData';
import INDICATORS from './utils/indicators';

const indicators = INDICATORS
  .filter(({ id }) => appConfig.homepage.charts.includes(id))
  .sort((a, b) => {
    if (appConfig.homepage.charts.indexOf(a.id) > appConfig.homepage.charts.indexOf(b.id)) {
      return 1;
    }

    if (appConfig.homepage.charts.indexOf(a.id) < appConfig.homepage.charts.indexOf(b.id)) {
      return -1;
    }

    return 0;
  });

const ChainIndicators = () => {
  const [ selectedIndicator, selectIndicator ] = React.useState(indicators[0]?.id);
  const indicator = indicators.find(({ id }) => id === selectedIndicator);

  const queryResult = useFetchChartData(indicator);

  const fetch = useFetch();
  const statsQueryResult = useQuery<unknown, unknown, HomeStats>(
    [ QueryKeys.homeStats ],
    () => fetch('/node-api/stats'),
  );

  const bgColorDesktop = useColorModeValue('white', 'gray.900');
  const bgColorMobile = useColorModeValue('white', 'black');
  const listBgColorDesktop = useColorModeValue('gray.50', 'black');
  const listBgColorMobile = useColorModeValue('gray.50', 'gray.900');

  if (indicators.length === 0) {
    return null;
  }

  const valueTitle = (() => {
    if (statsQueryResult.isLoading) {
      return <Skeleton h="48px" w="215px" mt={ 3 } mb={ 4 }/>;
    }

    if (statsQueryResult.isError) {
      return <Text mt={ 3 } mb={ 4 }>There is no data</Text>;
    }

    return (
      <Text fontWeight={ 600 } fontFamily="heading" fontSize="48px" lineHeight="48px" mt={ 3 } mb={ 4 }>
        { indicator?.value(statsQueryResult.data) }
      </Text>
    );
  })();

  return (
    <Flex
      p={{ base: 0, lg: 8 }}
      borderRadius={{ base: 'none', lg: 'lg' }}
      boxShadow={{ base: 'none', lg: 'xl' }}
      bgColor={{ base: bgColorMobile, lg: bgColorDesktop }}
      columnGap={ 12 }
      rowGap={ 0 }
      flexDir={{ base: 'column', lg: 'row' }}
      w="100%"
      alignItems="stretch"
      mt={ 8 }
    >
      <Flex flexGrow={ 1 } flexDir="column" order={{ base: 2, lg: 1 }} p={{ base: 6, lg: 0 }}>
        <Flex alignItems="center">
          <Text fontWeight={ 500 } fontFamily="heading" fontSize="lg">{ indicator?.title }</Text>
          { indicator?.hint && (
            <Tooltip label={ indicator.hint } maxW="300px">
              <Box display="inline-flex" cursor="pointer" ml={ 1 }>
                <Icon as={ infoIcon } boxSize={ 4 }/>
              </Box>
            </Tooltip>
          ) }
        </Flex>
        { valueTitle }
        <ChainIndicatorChartContainer { ...queryResult }/>
      </Flex>
      { indicators.length > 1 && (
        <Flex
          flexShrink={ 0 }
          flexDir="column"
          as="ul"
          p={ 3 }
          borderRadius="lg"
          bgColor={{ base: listBgColorMobile, lg: listBgColorDesktop }}
          rowGap={ 3 }
          order={{ base: 1, lg: 2 }}
        >
          { indicators.map((indicator) => (
            <ChainIndicatorItem
              key={ indicator.id }
              { ...indicator }
              isSelected={ selectedIndicator === indicator.id }
              onClick={ selectIndicator }
              stats={ statsQueryResult }
            />
          )) }
        </Flex>
      ) }
    </Flex>
  );
};

export default ChainIndicators;