function RealMap({ country, playing, accent = '#1B8A5A' }) {
  const mapRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const markerRef = React.useRef(null);

  React.useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      touchZoom: false,
      keyboard: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  React.useEffect(() => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L) return;

    if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null; }

    if (!playing) {
      map.setView([20, 0], 2, { animate: false });
      return;
    }

    const [lat, lng] = country.center;
    map.flyTo([lat, lng], country.zoom, {
      duration: 2.0,
      easeLinearity: 0.2,
    });

    const t = setTimeout(() => {
      const jitter = country.zoom >= 10 ? 0.02 : 1.2;
      const jLat = lat + (Math.random() - 0.5) * jitter;
      const jLng = lng + (Math.random() - 0.5) * jitter * 1.5;

      const pinHtml = '<div style="position:relative;">' +
        '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%;background:' + accent + ';opacity:0.2;animation:tracify-mapring 1.8s ease-out infinite;"></div>' +
        '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%;background:' + accent + ';opacity:0.15;animation:tracify-mapring 1.8s ease-out 0.6s infinite;"></div>' +
        '<svg width="32" height="42" viewBox="0 0 32 42" style="position:relative;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.25));animation:tracify-pindrop 0.5s cubic-bezier(0.3,1.5,0.5,1);">' +
        '<path d="M16 1C8 1 2 7 2 15c0 5 4 10 7 13l6 9c.5.7 1.5.7 2 0l6-9c3-3 7-8 7-13 0-8-6-14-14-14z" fill="' + accent + '"/>' +
        '<circle cx="16" cy="15" r="5" fill="#fff"/>' +
        '</svg></div>';

      const icon = L.divIcon({
        html: pinHtml,
        className: 'tracify-pin-icon',
        iconSize: [32, 42],
        iconAnchor: [16, 40],
      });
      markerRef.current = L.marker([jLat, jLng], { icon }).addTo(map);
    }, 2100);

    return () => clearTimeout(t);
  }, [country.code, country.center[0], country.center[1], country.zoom, playing, accent]);

  return (
    <div ref={containerRef} style={{
      position: 'absolute', inset: 0, background: '#EFE8DA',
    }} />
  );
}

window.RealMap = RealMap;
