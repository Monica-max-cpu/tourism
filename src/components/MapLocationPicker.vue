<script setup lang="ts">
import { ref, watch } from 'vue';
import { load } from '@amap/amap-jsapi-loader';
import { MapPin, Crosshair, Loader2 } from 'lucide-vue-next';

(window as any)._AMapSecurityConfig = {
  securityJsCode: 'dcfc0d4a2e948152792bb52f2566df07',
};

const API_KEY = 'e9af730325e4236fd6035eb21cf97065';

const emit = defineEmits<{
  select: [data: { province: string; city: string; address: string; mapAddress: string; coordinate: string }];
}>();

const props = defineProps<{
  modelValue?: string;
}>();

const mapRef = ref<HTMLDivElement>();
const loading = ref(true);
const locating = ref(false);
const selectedAddress = ref('');

let aMap: any = null;
let mapInstance: any = null;
let currentMarker: any = null;
let placeSearch: any = null;
let autoComplete: any = null;

function destroyMap() {
  if (autoComplete) {
    autoComplete.destroy();
    autoComplete = null;
  }
  if (placeSearch) {
    placeSearch.clear();
    placeSearch = null;
  }
  if (mapInstance) {
    mapInstance.destroy();
    mapInstance = null;
  }
  currentMarker = null;
}

function addMarker(lng: number, lat: number) {
  if (!aMap || !mapInstance) return;
  if (currentMarker) mapInstance.remove(currentMarker);
  currentMarker = new aMap.Marker({
    position: new aMap.LngLat(lng, lat),
    title: selectedAddress.value || `${lng},${lat}`,
  });
  mapInstance.add(currentMarker);
  mapInstance.setCenter([lng, lat], undefined, 500);
}

function geoAddress(lng: number, lat: number) {
  return new Promise<{ province: string; city: string; address: string }>((resolve) => {
    const gc = new aMap.Geocoder({ radius: 1000, extensions: 'all' });
    gc.getAddress([lng, lat], (_status: string, result: any) => {
      if (_status === 'complete' && result.regeocode) {
        const c = result.regeocode.addressComponent;
        resolve({
          province: c.province || '',
          city: c.city || c.district || '',
          address: result.regeocode.formattedAddress || '',
        });
      } else {
        resolve({ province: '', city: '', address: '' });
      }
    });
  });
}

async function emitSelect(lng: number, lat: number) {
  const geo = await geoAddress(lng, lat);
  const coord = `${lng.toFixed(6)},${lat.toFixed(6)}`;
  selectedAddress.value = geo.address;
  emit('select', { ...geo, mapAddress: coord, coordinate: coord });
}

async function initMap(m: any) {
  destroyMap();
  try {
    const AMap = await load({
      key: API_KEY,
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.Marker', 'AMap.Geocoder', 'AMap.PlaceSearch', 'AMap.AutoComplete'],
    });
    aMap = AMap;

    // 等待 DOM ref 就绪
    if (!mapRef.value) {
      setTimeout(() => initMap(m), 50);
      return;
    }

    const center = (m && m.length === 2) ? m : [112.55, 37.87];
    const zoom = (m && m.length === 2) ? 16 : 12;

    mapInstance = new AMap.Map(mapRef.value, {
      viewMode: '3D',
      zoom,
      center,
      resizeEnable: true,
    });

    // 搜索自动补全
    autoComplete = new AMap.AutoComplete({ input: 'map-search-input' });
    placeSearch = new AMap.PlaceSearch({ map: mapInstance, autoFitView: true });
    autoComplete.on('select', (e: any) => {
      placeSearch.setCity(e.poi.adcode);
      placeSearch.search(e.poi.name);
      // 获取坐标：AMap 2.0 LngLat 同时支持 .lng 属性和 .getLng() 方法
      const loc = e.poi.location;
      const lng = typeof loc.lng === 'number' ? loc.lng : loc.getLng();
      const lat = typeof loc.lat === 'number' ? loc.lat : loc.getLat();
      if (typeof lng === 'number' && typeof lat === 'number') {
        addMarker(lng, lat);
        emitSelect(lng, lat);
      }
    });

    // 地图点击
    mapInstance.on('click', (e: any) => {
      const lng = e.lnglat.getLng();
      const lat = e.lnglat.getLat();
      addMarker(lng, lat);
      emitSelect(lng, lat);
    });

    // 已有坐标 - 恢复标记
    if (m && m.length === 2) {
      addMarker(m[0], m[1]);
      const geo = await geoAddress(m[0], m[1]);
      selectedAddress.value = geo.address;
    }

    loading.value = false;
  } catch (err) {
    console.error('[MapLocationPicker] 地图初始化失败:', err);
    loading.value = false;
  }
}

function handleLocate() {
  if (!navigator.geolocation || !aMap || !mapInstance) return;
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lng = pos.coords.longitude;
      const lat = pos.coords.latitude;
      addMarker(lng, lat);
      mapInstance.setZoom(16);
      await emitSelect(lng, lat);
      if (placeSearch) placeSearch.searchNearBy('', [lng, lat], 1000);
      locating.value = false;
    },
    () => { locating.value = false; },
    { timeout: 10000, enableHighAccuracy: true },
  );
}

// 参考 MapPointSelection: watch + immediate 触发初始化
watch(() => props.modelValue, (val) => {
  if (!val) {
    initMap(null);
  } else {
    initMap(val.split(',').map(Number));
  }
}, { immediate: true });
</script>

<template>
  <div class="space-y-3">
    <input
      id="map-search-input"
      class="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      placeholder="搜索地址..."
    />

    <div class="relative rounded-lg border border-border overflow-hidden" style="height: 300px;">
      <div ref="mapRef" style="width: 100%; height: 100%;" />

      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-muted/20 z-20"
      >
        <Loader2 class="h-8 w-8 text-muted-foreground animate-spin" />
      </div>

      <!-- 我的位置 -->
      <button
        type="button"
        class="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white rounded-lg shadow-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        :disabled="locating"
        @click="handleLocate"
      >
        <Loader2 v-if="locating" class="h-3.5 w-3.5 animate-spin" />
        <Crosshair v-else class="h-3.5 w-3.5 text-primary" />
        {{ locating ? '定位中...' : '我的位置' }}
      </button>
    </div>

    <div v-if="selectedAddress" class="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
      <MapPin class="h-4 w-4 shrink-0 text-primary" />
      <span class="truncate">{{ selectedAddress }}</span>
    </div>
  </div>
</template>
