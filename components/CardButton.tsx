import * as React from "react";
import { View } from "react-native";
import { Avatar, Button, Card, Icon, Text } from "react-native-paper";

type CardButtonProps = {
  title: string;
};

export default function CardButton(props: CardButtonProps) {
  return (
    <Button>
      <Card mode="elevated" style={{ width: "100%" }}>
        <Card.Content>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text variant="titleSmall">{props.title}</Text>
            <Icon source="arrow-right" size={20} />
          </View>
        </Card.Content>
      </Card>
    </Button>
  );
}
