import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Compass,
  MapPin,
  Anchor,
  Ship,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { waypointsDatabase, decadeMilestones, atlanticBasinLandGeoJSON } from '../data/cartographyData';
import type { Waypoint, DecadeMilestone } from '../data/cartographyData';
import type { HistoricalRecord } from '../types/genealogy';
import { historicalRecordsDatabase } from '../data/genealogyData';

interface D3MigrationMapProps {
  onSelectRecord?: (record: HistoricalRecord) => void;
  branchFilter?: 'both' | 'suraci' | 'cardillo';
  onBranchFilterChange?: (filter: 'both' | 'suraci' | 'cardillo') => void;
}

export const D3MigrationMap: React.FC<D3MigrationMapProps> = ({
  onSelectRecord,
  branchFilter: externalBranchFilter,
  onBranchFilterChange,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedDecade, setSelectedDecade] = useState<number>(1890); // default to peak transatlantic decade
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [internalBranchFilter, setInternalBranchFilter] = useState<'both' | 'suraci' | 'cardillo'>('both');
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(waypointsDatabase[4]); // Port of Genoa default
  const [hoveredWaypoint, setHoveredWaypoint] = useState<Waypoint | null>(null);

  // Synchronized active branch filter
  const activeBranchFilter = externalBranchFilter ?? internalBranchFilter;

  const handleBranchChange = (newBranch: 'both' | 'suraci' | 'cardillo') => {
    if (onBranchFilterChange) {
      onBranchFilterChange(newBranch);
    } else {
      setInternalBranchFilter(newBranch);
    }

    // Auto-select a characteristic waypoint for this branch
    if (newBranch === 'suraci') {
      setSelectedWaypoint(waypointsDatabase[0]); // Reggio Calabria
    } else if (newBranch === 'cardillo') {
      setSelectedWaypoint(waypointsDatabase[2]); // Castelnuovo Cilento
    } else {
      setSelectedWaypoint(waypointsDatabase[4]); // Genoa / Transatlantic Hub
    }
  };

  // Active Decade Data
  const currentMilestone = useMemo(
    () => decadeMilestones.find((m) => m.decade === selectedDecade) || decadeMilestones[3],
    [selectedDecade]
  );

  // Auto-play timer through the decades
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSelectedDecade((prev) => {
        const currentIndex = decadeMilestones.findIndex((m) => m.decade === prev);
        const nextIndex = (currentIndex + 1) % decadeMilestones.length;
        return decadeMilestones[nextIndex].decade;
      });
    }, 3800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // D3 Map Rendering & Zoom Behavior
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 980;
    const height = Math.max(520, Math.min(680, window.innerHeight * 0.65));

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // D3 Mercator Projection calibrated for the Atlantic migratory corridor
    const projection = d3
      .geoMercator()
      .center([-16, 12]) // Center between Atlantic equator, W. Mediterranean, and Brazil
      .scale(width * 0.42)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Zoom container root group
    const g = svg.append('g').attr('class', 'map-root-group');

    // D3 Zoom Setup
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.7, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Store zoom reference on SVG node for external controls
    (svgRef.current as any).__zoomBehavior = zoom;
    (svgRef.current as any).__projection = projection;
    (svgRef.current as any).__width = width;
    (svgRef.current as any).__height = height;

    // --- 1. Graticule Grid (Meridians & Parallels) ---
    const graticule = d3.geoGraticule().step([15, 15]);
    g.append('path')
      .datum(graticule())
      .attr('class', 'graticule')
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#E4DDD0')
      .attr('stroke-width', 0.65)
      .attr('stroke-dasharray', '2,3');

    // Equator Line (0°)
    const equatorGeo: GeoJSON.Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-75, 0],
          [25, 0],
        ],
      },
    };
    g.append('path')
      .datum(equatorGeo)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#C8BDAB')
      .attr('stroke-width', 0.9)
      .attr('stroke-dasharray', '4,4');

    // Tropic of Cancer (+23.4° N) & Capricorn (-23.4° S)
    const cancerGeo: GeoJSON.Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-75, 23.43],
          [25, 23.43],
        ],
      },
    };
    const capricornGeo: GeoJSON.Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-75, -23.43],
          [25, -23.43],
        ],
      },
    };

    g.append('path')
      .datum(cancerGeo)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#D9D0C1')
      .attr('stroke-width', 0.6)
      .attr('stroke-dasharray', '2,4');

    g.append('path')
      .datum(capricornGeo)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#D9D0C1')
      .attr('stroke-width', 0.6)
      .attr('stroke-dasharray', '2,4');

    // --- 2. Landmasses (Europe, Africa, South America) ---
    g.selectAll('path.land')
      .data(atlanticBasinLandGeoJSON.features)
      .enter()
      .append('path')
      .attr('class', 'land')
      .attr('d', pathGenerator)
      .attr('fill', '#EDE5D6')
      .attr('stroke', '#D2C6B3')
      .attr('stroke-width', 1.1)
      .attr('stroke-linejoin', 'round');

    // --- 3. Ocean Labels & Cartographic Typography ---
    const [atlanticX, atlanticY] = projection([-26, 8]) || [width * 0.45, height * 0.45];
    g.append('text')
      .attr('x', atlanticX)
      .attr('y', atlanticY)
      .attr('text-anchor', 'middle')
      .attr('class', 'font-display')
      .attr('fill', '#C2B7A3')
      .attr('font-size', '14px')
      .attr('letter-spacing', '0.28em')
      .attr('font-style', 'italic')
      .text('OCEANUS ATLANTICUS');

    const [medX, medY] = projection([6, 38.5]) || [0, 0];
    g.append('text')
      .attr('x', medX)
      .attr('y', medY)
      .attr('text-anchor', 'middle')
      .attr('class', 'font-display')
      .attr('fill', '#C2B7A3')
      .attr('font-size', '10px')
      .attr('letter-spacing', '0.15em')
      .attr('font-style', 'italic')
      .text('Mare Nostrum');

    // --- 4. Migratory Path Curves ---
    // Suraci / Sorage Route Points
    const suraciCoords: [number, number][] = [
      [15.65, 38.11], // Reggio Calabria
      [15.71, 38.25], // Scilla
      [8.92, 44.41], // Genoa
      [-5.35, 36.14], // Strait of Gibraltar
      [-17.0, 32.0], // Off Madeira
      [-24.5, 5.0], // Mid-Atlantic Crossing
      [-36.0, -10.0], // Coast of Brazil
      [-46.33, -23.96], // Port of Santos
      [-46.61, -23.54], // Hospedaria do Brás
      [-46.59, -23.56], // Mooca, São Paulo
    ];

    // Cardillo / Cardilho Route Points
    const cardilloCoords: [number, number][] = [
      [15.15, 40.19], // Castelnuovo Cilento
      [14.48, 40.69], // Castellammare di Stabia
      [8.92, 44.41], // Genoa
      [-5.35, 36.14], // Gibraltar
      [-19.0, 28.0], // Canary swell
      [-25.5, 6.5], // Equatorial run
      [-38.0, -12.0], // Bahia offshore
      [-46.33, -23.96], // Santos
      [-46.61, -23.54], // Hospedaria do Brás
      [-47.06, -22.90], // Fazenda Santa Gertrudes & Campinas
      [-46.64, -23.55], // Bixiga (1932 Union)
    ];

    // Project coordinates to 2D pixel coordinates
    const projectCoords = (pts: [number, number][]) => {
      return pts
        .map((p) => projection(p))
        .filter((p): p is [number, number] => p !== null && !isNaN(p[0]) && !isNaN(p[1]));
    };

    const suraciPoints = projectCoords(suraciCoords);
    const cardilloPoints = projectCoords(cardilloCoords);

    // Smooth cardinal curve generator for realistic maritime sailing curves
    const curveLine = d3
      .line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Progress percentage based on active decade
    const progressFactor = currentMilestone.activeRouteProgress / 100;

    // Route 1: Suraci / Sorage Path
    if (activeBranchFilter === 'both' || activeBranchFilter === 'suraci') {
      const pathSuraci = g
        .append('path')
        .attr('class', 'route-suraci')
        .attr('d', curveLine(suraciPoints))
        .attr('fill', 'none')
        .attr('stroke', '#8C3A27')
        .attr('stroke-width', 2.2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('opacity', selectedDecade < 1880 ? 0.3 : 0.9);

      // Animate progress with stroke-dasharray based on the active decade
      const totalLength = pathSuraci.node()?.getTotalLength() || 1000;
      pathSuraci
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength * (1 - progressFactor))
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', totalLength * (1 - progressFactor));

      // Animated traveling ship beacon for active migration decade (1890s)
      if (selectedDecade >= 1890 && progressFactor > 0.3) {
        const currentDist = totalLength * Math.min(0.98, progressFactor);
        const point = pathSuraci.node()?.getPointAtLength(currentDist);
        if (point) {
          const beacon = g
            .append('g')
            .attr('class', 'suraci-beacon')
            .attr('transform', `translate(${point.x}, ${point.y})`);

          beacon
            .append('circle')
            .attr('r', 5.5)
            .attr('fill', '#8C3A27')
            .attr('stroke', '#FFFFFF')
            .attr('stroke-width', 1.5);

          beacon
            .append('circle')
            .attr('r', 11)
            .attr('fill', 'none')
            .attr('stroke', '#8C3A27')
            .attr('stroke-width', 1)
            .attr('opacity', 0.6)
            .append('animate')
            .attr('attributeName', 'r')
            .attr('from', '5')
            .attr('to', '15')
            .attr('dur', '1.8s')
            .attr('repeatCount', 'indefinite');
        }
      }
    }

    // Route 2: Cardillo / Cardilho Path
    if (activeBranchFilter === 'both' || activeBranchFilter === 'cardillo') {
      const pathCardillo = g
        .append('path')
        .attr('class', 'route-cardillo')
        .attr('d', curveLine(cardilloPoints))
        .attr('fill', 'none')
        .attr('stroke', '#2B6CB0')
        .attr('stroke-width', 2.2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-dasharray', selectedDecade < 1890 ? '4,4' : 'none')
        .attr('opacity', selectedDecade < 1880 ? 0.3 : 0.85);

      const totalLength = pathCardillo.node()?.getTotalLength() || 1000;
      pathCardillo
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength * (1 - progressFactor))
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', totalLength * (1 - progressFactor));

      if (selectedDecade >= 1890 && progressFactor > 0.35) {
        const currentDist = totalLength * Math.min(0.95, progressFactor * 0.95);
        const point = pathCardillo.node()?.getPointAtLength(currentDist);
        if (point) {
          const beacon = g
            .append('g')
            .attr('class', 'cardillo-beacon')
            .attr('transform', `translate(${point.x}, ${point.y})`);

          beacon
            .append('circle')
            .attr('r', 5)
            .attr('fill', '#2B6CB0')
            .attr('stroke', '#FFFFFF')
            .attr('stroke-width', 1.5);
        }
      }
    }

    // --- 5. Interactive Waypoint Pins ---
    const waypointsGroup = g.append('g').attr('class', 'waypoints-group');

    // Filter waypoints by branch filter
    const visibleWaypoints = waypointsDatabase.filter((wp) => {
      if (activeBranchFilter !== 'both' && wp.branch !== activeBranchFilter && wp.branch !== 'both') {
        return false;
      }
      return true;
    });

    visibleWaypoints.forEach((wp) => {
      const pt = projection(wp.coordinates);
      if (!pt) return;

      const [px, py] = pt;
      const isHistoricalYet = selectedDecade >= wp.decadeIntroduced;
      const isSelected = selectedWaypoint?.id === wp.id;
      const isHighlightedInDecade = currentMilestone.activeWaypointIds.includes(wp.id);

      const pinColor =
        wp.branch === 'suraci' ? '#8C3A27' : wp.branch === 'cardillo' ? '#2B6CB0' : '#44403C';

      const wpNode = waypointsGroup
        .append('g')
        .attr('class', `waypoint-node cursor-pointer`)
        .attr('transform', `translate(${px}, ${py})`)
        .style('cursor', 'pointer')
        .on('click', () => {
          setSelectedWaypoint(wp);
        })
        .on('mouseenter', () => {
          setHoveredWaypoint(wp);
        })
        .on('mouseleave', () => {
          setHoveredWaypoint(null);
        });

      // Halo if active in current decade
      if (isHighlightedInDecade && isHistoricalYet) {
        wpNode
          .append('circle')
          .attr('r', isSelected ? 14 : 9)
          .attr('fill', pinColor)
          .attr('opacity', 0.22)
          .attr('class', 'active-halo');
      }

      // Outer ring
      wpNode
        .append('circle')
        .attr('r', isSelected ? 8 : 5.5)
        .attr('fill', isHistoricalYet ? pinColor : '#DDD5C7')
        .attr('stroke', '#FBF9F5')
        .attr('stroke-width', 1.75);

      // Inner center dot
      wpNode
        .append('circle')
        .attr('r', isSelected ? 3 : 2)
        .attr('fill', '#FBF9F5');

      // Permanent subtle label on map for key cities
      if (['wp-reggio-calabria', 'wp-castelnuovo-cilento', 'wp-genova', 'wp-santos', 'wp-mooca'].includes(wp.id)) {
        wpNode
          .append('text')
          .attr('x', wp.coordinates[0] > 0 ? 9 : -9)
          .attr('y', 3.5)
          .attr('text-anchor', wp.coordinates[0] > 0 ? 'start' : 'end')
          .attr('font-size', '10px')
          .attr('class', 'font-sans font-semibold pointer-events-none select-none')
          .attr('fill', isHistoricalYet ? '#1C1917' : '#9CA3AF')
          .text(wp.name.split('(')[0].trim());
      }
    });

    // --- 6. Nautical Compass Rose in the Gulf of Guinea ---
    const [compassX, compassY] = projection([-2, -14]) || [width * 0.58, height * 0.75];
    const compassGroup = g
      .append('g')
      .attr('class', 'compass-rose')
      .attr('transform', `translate(${compassX}, ${compassY}) opacity-50`);

    compassGroup
      .append('circle')
      .attr('r', 18)
      .attr('fill', 'none')
      .attr('stroke', '#D9D0C1')
      .attr('stroke-width', 0.8)
      .attr('stroke-dasharray', '1,2');

    // Compass points (N, S, E, W)
    compassGroup
      .append('polygon')
      .attr('points', '0,-18 3,-5 0,0 -3,-5')
      .attr('fill', '#8C3A27');
    compassGroup
      .append('polygon')
      .attr('points', '0,18 3,5 0,0 -3,5')
      .attr('fill', '#C2B7A3');
    compassGroup
      .append('polygon')
      .attr('points', '18,0 5,3 0,0 5,-3')
      .attr('fill', '#C2B7A3');
    compassGroup
      .append('polygon')
      .attr('points', '-18,0 -5,3 0,0 -5,-3')
      .attr('fill', '#C2B7A3');

    compassGroup
      .append('text')
      .attr('x', 0)
      .attr('y', -22)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('font-family', 'serif')
      .attr('fill', '#8C3A27')
      .attr('font-weight', 'bold')
      .text('N');
  }, [selectedDecade, activeBranchFilter, selectedWaypoint]);

  // Zoom preset handlers
  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoomBehavior = (svgRef.current as any).__zoomBehavior;
    if (zoomBehavior) {
      svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.4);
    }
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoomBehavior = (svgRef.current as any).__zoomBehavior;
    if (zoomBehavior) {
      svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoomBehavior = (svgRef.current as any).__zoomBehavior;
    if (zoomBehavior) {
      svg.transition().duration(750).call(zoomBehavior.transform, d3.zoomIdentity);
    }
  };

  const handleFocusRegion = (region: 'italy' | 'atlantic' | 'brazil') => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoomBehavior = (svgRef.current as any).__zoomBehavior;
    const projection = (svgRef.current as any).__projection;
    const width = (svgRef.current as any).__width || 900;
    const height = (svgRef.current as any).__height || 550;

    if (!zoomBehavior || !projection) return;

    let targetCoords: [number, number];
    let targetScale: number;

    switch (region) {
      case 'italy':
        targetCoords = [14.0, 41.0]; // Italy center
        targetScale = 3.6;
        break;
      case 'atlantic':
        targetCoords = [-18.0, 10.0]; // Mid-Atlantic center
        targetScale = 1.35;
        break;
      case 'brazil':
        targetCoords = [-46.5, -23.6]; // São Paulo / Santos
        targetScale = 3.8;
        break;
    }

    const pt = projection(targetCoords);
    if (!pt) return;

    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(targetScale)
      .translate(-pt[0], -pt[1]);

    svg.transition().duration(1000).ease(d3.easeCubicOut).call(zoomBehavior.transform, transform);
  };

  const handleInspectHistoricalRecord = (recordId: string) => {
    const record = historicalRecordsDatabase.find((r) => r.id === recordId);
    if (record && onSelectRecord) {
      onSelectRecord(record);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Header Strip with Decade Selector & Legend */}
      <div className="bg-white border border-[#E7E2D8] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#8C3A27] flex items-center gap-1.5 mb-1">
              <Compass className="w-4 h-4" />
              <span>Interactive D3 Transatlantic Migration Atlas</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#1C1917]">
              Geographic Shift: Southern Italy ➔ São Paulo
            </h2>
          </div>

          {/* Branch Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F4EFE6] rounded-lg shrink-0">
            <button
              onClick={() => handleBranchChange('both')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeBranchFilter === 'both'
                  ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Both Families (Convergence)
            </button>
            <button
              onClick={() => handleBranchChange('suraci')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeBranchFilter === 'suraci'
                  ? 'bg-white text-[#8C3A27] shadow-xs font-semibold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Suraci / Sorage
            </button>
            <button
              onClick={() => handleBranchChange('cardillo')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeBranchFilter === 'cardillo'
                  ? 'bg-white text-[#2B6CB0] shadow-xs font-semibold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Cardillo / Cardilo
            </button>
          </div>
        </div>

        {/* Decade Timeline Scrubber Bar */}
        <div className="pt-2 border-t border-[#F2ECE1] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1C1917] hover:bg-[#342F2C] text-white transition-colors cursor-pointer shadow-xs"
                title={isPlaying ? 'Pause timeline progression' : 'Play timeline progression across decades'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Auto Play Decades'}</span>
              </button>

              <div className="text-xs font-mono text-[#78716C] hidden sm:block">
                <span>Active Period: </span>
                <strong className="text-[#1C1917]">{currentMilestone.periodSpan}</strong>
              </div>
            </div>

            {/* Quick Regional Focus Jump Buttons */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[#78716C] mr-1 hidden md:inline">Focus Camera:</span>
              <button
                onClick={() => handleFocusRegion('italy')}
                className="px-2.5 py-1 text-xs rounded bg-[#FAF7F0] hover:bg-[#F3EFE6] border border-[#E2DACB] text-[#57534E] hover:text-[#1C1917] transition-colors cursor-pointer"
              >
                Italy Cradle
              </button>
              <button
                onClick={() => handleFocusRegion('atlantic')}
                className="px-2.5 py-1 text-xs rounded bg-[#FAF7F0] hover:bg-[#F3EFE6] border border-[#E2DACB] text-[#57534E] hover:text-[#1C1917] transition-colors cursor-pointer"
              >
                Atlantic Run
              </button>
              <button
                onClick={() => handleFocusRegion('brazil')}
                className="px-2.5 py-1 text-xs rounded bg-[#FAF7F0] hover:bg-[#F3EFE6] border border-[#E2DACB] text-[#57534E] hover:text-[#1C1917] transition-colors cursor-pointer"
              >
                São Paulo
              </button>
            </div>
          </div>

          {/* Interactive Decade Tabs */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {decadeMilestones.map((m) => {
              const isSelected = selectedDecade === m.decade;
              return (
                <button
                  key={m.decade}
                  onClick={() => {
                    setSelectedDecade(m.decade);
                    setIsPlaying(false);
                  }}
                  className={`text-center py-2 px-1 rounded-lg border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-xs'
                      : 'bg-[#FAF8F5] text-[#57534E] border-[#E7E2D8] hover:border-[#D6CEBE]'
                  }`}
                >
                  <div className="font-mono text-xs font-semibold">{m.label}</div>
                  <div
                    className={`text-[10px] truncate max-w-full block mt-0.5 ${
                      isSelected ? 'text-[#E5DFD3]' : 'text-[#78716C]'
                    }`}
                  >
                    {m.theme.split('&')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* D3 Map Canvas Viewport with Overlay Controls */}
      <div
        ref={containerRef}
        className="relative bg-[#FBF9F5] border border-[#E7E2D8] rounded-2xl overflow-hidden shadow-xs h-[520px] sm:h-[600px] select-none"
      >
        {/* Subtle Archival Map Paper Grain */}
        <div className="absolute inset-0 paper-grain pointer-events-none opacity-50 z-0" />

        {/* D3 SVG Element */}
        <svg ref={svgRef} className="w-full h-full relative z-10 block" />

        {/* Floating Zoom & Reset Toolbar */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/90 backdrop-blur-md border border-[#E5DFD3] rounded-lg p-1.5 shadow-sm">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F0E6] rounded transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F0E6] rounded transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-[#E7E0D2] my-0.5" />
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F0E6] rounded transition-colors cursor-pointer"
            title="Reset Global Passage"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Active Decade Callout Card (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md border border-[#E5DFD3] rounded-xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#78716C] border-b border-[#F2ECE1] pb-1.5">
            <span className="font-semibold text-[#8C3A27]">{currentMilestone.label}</span>
            <span>Locus: {currentMilestone.geographicLocus}</span>
          </div>

          <h3 className="font-display text-base font-semibold text-[#1C1917]">
            {currentMilestone.theme}
          </h3>

          <p className="font-editorial text-xs text-[#44403C] leading-relaxed line-clamp-3">
            {currentMilestone.historicalContext}
          </p>

          <div className="pt-1.5 border-t border-[#F2ECE1] grid grid-cols-2 gap-2 text-[11px] font-sans">
            <div className="truncate">
              <span className="font-medium text-[#8C3A27]">Suraci: </span>
              <span className="text-[#57534E]">{currentMilestone.suraciStatus.split('.')[0]}</span>
            </div>
            <div className="truncate">
              <span className="font-medium text-[#2B6CB0]">Cardillo: </span>
              <span className="text-[#57534E]">{currentMilestone.cardilloStatus.split('.')[0]}</span>
            </div>
          </div>
        </div>

        {/* Floating Route Legend (Top Left) */}
        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md border border-[#E5DFD3] rounded-lg px-3 py-2 text-xs font-sans shadow-xs space-y-1">
          <div className="text-[10px] uppercase font-semibold text-[#78716C] tracking-wider">
            Cartographic Legend
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#8C3A27]" />
            <span className="text-[11px] text-[#292524]">Suraci ➔ Sorage (Reggio ➔ Mooca)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#2B6CB0]" />
            <span className="text-[11px] text-[#292524]">Cardillo ➔ Cardilho (Cilento ➔ Bixiga)</span>
          </div>
        </div>
      </div>

      {/* Selected Waypoint Detailed Dossier (Encyclopedia Style) */}
      {selectedWaypoint && (
        <div className="bg-white border border-[#E7E2D8] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E7E2D8] pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#78716C] mb-1">
                <span className="uppercase text-[#8C3A27] font-semibold">
                  {selectedWaypoint.type.replace(/_/g, ' ')}
                </span>
                <span aria-hidden="true">·</span>
                <span>Coordinates: {selectedWaypoint.coordinates[1]}° N, {selectedWaypoint.coordinates[0]}° E</span>
                <span aria-hidden="true">·</span>
                <span>Active Since {selectedWaypoint.decadeIntroduced}s</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                {selectedWaypoint.name}
              </h3>
              {(selectedWaypoint.italianName || selectedWaypoint.brazilianName) && (
                <p className="font-editorial text-sm italic text-[#57534E] mt-0.5">
                  {selectedWaypoint.italianName || selectedWaypoint.brazilianName}
                </p>
              )}
            </div>

            <div className="text-xs font-sans text-[#78716C] bg-[#F5F0E6] px-3 py-1.5 rounded-md border border-[#E7E0D2]">
              {selectedWaypoint.region} ({selectedWaypoint.country})
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-8 space-y-3 font-editorial text-base text-[#292524] leading-relaxed">
              <p>{selectedWaypoint.description}</p>

              <div className="bg-[#FAF7F0] border border-[#E5DFD3] rounded-lg p-4 space-y-1.5 text-xs font-sans">
                <div className="font-semibold text-[#8C3A27] uppercase tracking-wider text-[11px]">
                  Archival Primary Documentation:
                </div>
                <p className="text-[#57534E] leading-relaxed">
                  {selectedWaypoint.archivalFact}
                </p>
                {selectedWaypoint.historicalRecordId && onSelectRecord && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleInspectHistoricalRecord(selectedWaypoint.historicalRecordId!)}
                      className="text-xs text-[#8C3A27] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Primary Document Facsimile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-4 bg-[#FAF8F5] border border-[#E7E2D8] p-4 rounded-lg space-y-3 text-xs font-sans">
              <div className="font-semibold text-[#1C1917] uppercase tracking-wider text-[11px] border-b border-[#E7E2D8] pb-1.5">
                Key Lineage Figures:
              </div>
              <ul className="space-y-1 text-[#57534E]">
                {selectedWaypoint.keyAncestors.map((ancestor, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C3A27]" />
                    <span>{ancestor}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 text-[11px] text-[#78716C] border-t border-[#E7E2D8]">
                Branch:{' '}
                <strong className="text-[#1C1917]">
                  {selectedWaypoint.branch === 'suraci'
                    ? 'Suraci / Sorage'
                    : selectedWaypoint.branch === 'cardillo'
                    ? 'Cardillo / Cardilo'
                    : 'Unified Families'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
