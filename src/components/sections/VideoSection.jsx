import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { videoApi } from '../../services/api';
import { EmptyState, LoadingState } from '../ui/EmptyState';

export function VideoSection() {
  const { t } = useLanguage();
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const loadVideo = async () => {
      setLoading(true);
      try {
        const settings = await videoApi.get();
        if (settings?.videoUrl) {
          const url = settings.videoUrl;
          setVideoUrl(url);
          
          let id = '';
          if (url.includes('youtube.com/watch')) {
            const urlParams = new URL(url).searchParams;
            id = urlParams.get('v') || '';
          } else if (url.includes('youtu.be/')) {
            id = url.split('youtu.be/')[1]?.split('?')[0] || '';
          } else if (url.includes('youtube.com/embed/')) {
            id = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
          }
          setVideoId(id);
          setError(!id);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadVideo();
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';

  return (
    <section className="video-section animated" id="video-section">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('video.title') || "Qisqa videoni ko'ring"}
        </motion.h2>
        
        {loading ? (
          <LoadingState message="Video yuklanmoqda..." />
        ) : error || !videoId ? (
          <EmptyState message="Video mavjud emas" icon="🎥" />
        ) : (
          <motion.div 
            className="video-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {!isPlaying ? (
              <motion.div 
                className="video-thumbnail" 
                onClick={handlePlay}
                whileHover={{ scale: 1.02 }}
              >
                <img 
                  src={thumbnailUrl}
                  alt="Video thumbnail"
                  className="video-thumb-img"
                  loading="lazy"
                />
                <motion.div 
                  className="video-play-button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg viewBox="0 0 68 48" width="68" height="48">
                    <path 
                      fill="#f00" 
                      d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
                    />
                    <path fill="#fff" d="M 45,24 27,14 27,34" />
                  </svg>
                </motion.div>
              </motion.div>
            ) : (
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              />
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default VideoSection;
