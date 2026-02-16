import { Box, Group, Image } from '@mantine/core';
import classes from '../stylings/HeaderStyling.module.css';

export const MinimalHeader = () => {

  return (
    <Box
      className={classes.header}
    >
      <Group align="center" style={{ height: '100%' }}>
        <Image
          src="/GriangLogo_ws.png"
          alt="Logo"
          height={40}
          fit="contain"
        />
      </Group>
    </Box>
  );
};