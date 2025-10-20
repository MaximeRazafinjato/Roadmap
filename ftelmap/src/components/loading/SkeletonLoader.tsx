import { Skeleton, Box, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'timeline' | 'form';
  count?: number;
}

const MotionCard = motion(Card);

const pulseAnimation = {
  opacity: [0.4, 1, 0.4],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const SkeletonLoader = ({ variant = 'card', count = 1 }: SkeletonLoaderProps) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <MotionCard animate={pulseAnimation} sx={{ mb: 2, background: 'transparent' }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
              <Box sx={{ mt: 2 }}>
                <Skeleton variant="rectangular" height={40} />
              </Box>
            </CardContent>
          </MotionCard>
        );

      case 'list':
        return (
          <Box sx={{ mb: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div key={i} animate={pulseAnimation}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        );

      case 'timeline':
        return (
          <Box sx={{ position: 'relative', pl: 4 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i} animate={pulseAnimation}>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'start' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      width: 2,
                      height: '100%',
                      bgcolor: 'grey.300',
                    }}
                  />
                  <Skeleton
                    variant="circular"
                    width={12}
                    height={12}
                    sx={{
                      position: 'absolute',
                      left: -5,
                      bgcolor: 'grey.400',
                    }}
                  />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Skeleton variant="text" width="30%" height={24} />
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="50%" />
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        );

      case 'form':
        return (
          <motion.div animate={pulseAnimation}>
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={56} />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={56} />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={120} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="rectangular" width={100} height={40} />
              <Skeleton variant="rectangular" width={100} height={40} />
            </Box>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index}>{renderSkeleton()}</Box>
      ))}
    </>
  );
};
