import type { Zone, ContainerInfo } from '../types/container';

const generateContainerNumber = (): string => {
  const prefix = ['MSCU', 'TCLU', 'CSNU', 'HLXU', 'TEMU'];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const randomNumber = Math.floor(Math.random() * 9000000) + 1000000;
  const checkDigit = Math.floor(Math.random() * 10);
  return `${randomPrefix}${randomNumber}${checkDigit}`;
};

const generateShippingAgent = (): string => {
  const agents = [
    'Maersk Line',
    'MSC',
    'CMA CGM',
    'COSCO',
    'Hapag-Lloyd',
    'ONE',
    'Evergreen',
    'Yang Ming'
  ];
  return agents[Math.floor(Math.random() * agents.length)];
};

const generateYardInDate = (): string => {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * 30); // 0-30 days ago
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  
  // Set random time
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  date.setSeconds(Math.floor(Math.random() * 60));
  
  // Format: YYYY-MM-DD HH:MM:SS
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const generateContainerInfos = (stackCount: number): ContainerInfo[] => {
  return Array.from({ length: stackCount }, (_, i) => ({
    containerNumber: generateContainerNumber(),
    shippingAgent: generateShippingAgent(),
    yardInDate: generateYardInDate(),
    stackPosition: i + 1
  }));
};

export const generateZoneData = (): Zone[] => {
  const zoneNames = ['A', 'B', 'C', 'D', 'E'];
  
  return zoneNames.map((name, zoneIndex) => ({
    id: `zone-${name}`,
    name: name,
    containers: Array.from({ length: 9 }, (_, i) => {
      const stackCount = Math.floor(Math.random() * 5); // 0-4
      return {
        id: i + 1, // 1-9 for each zone
        stackCount: stackCount,
        containerInfos: generateContainerInfos(stackCount)
      };
    })
  }));
};
