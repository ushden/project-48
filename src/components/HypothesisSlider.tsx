import React, {useRef} from 'react';
import {Dimensions, View} from 'react-native';
import Animated, {useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import {Deduction} from '../types/case';
import {HypothesisCard} from './HypothesisCard';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.75;
const SPACING = 16;

type Props = {
  deductions: Deduction[];
  activeId: string | null;
  onChange: (id: string) => void;
};

export default function HypothesisSlider(props: Props) {
  const {deductions, activeId, onChange} = props;

  const scrollX = useSharedValue(0);
  const listRef = useRef(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    }
  });

  return (
    <Animated.FlatList
      ref={listRef}
      data={deductions}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={({item, index}) => (
        <HypothesisCard
          item={item}
          index={index}
          scrollX={scrollX}
          isActive={item.id === activeId}
        />
      )}
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_WIDTH + SPACING}
      decelerationRate="fast"
      contentContainerStyle={{
        paddingHorizontal: (width - ITEM_WIDTH) / 2
      }}
      ItemSeparatorComponent={() => (
        <View style={{width: SPACING}} />
      )}
      onMomentumScrollEnd={(e) => {
        const index = Math.round(
          e.nativeEvent.contentOffset.x /
          (ITEM_WIDTH + SPACING)
        );
        const item = deductions[index];
        if (item) onChange(item.id);
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    />
  );
}