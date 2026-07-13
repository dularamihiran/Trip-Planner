'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

interface StartingPointModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (address: string, lat: number, lng: number) => void;
    apiKey: string;
}

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.75rem',
};

const defaultCenter = {
    lat: 6.9271, // Colombo
    lng: 79.8612,
};

const libraries: ('places')[] = ['places'];

export default function StartingPointModal({ isOpen, onClose, onConfirm, apiKey }: StartingPointModalProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>(defaultCenter);
    const [selectedAddress, setSelectedAddress] = useState('Colombo, Sri Lanka');
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
        libraries: libraries
    });

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPos({ lat, lng });

            // Reverse geocode the clicked coordinates
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                if (status === 'OK' && results && results[0]) {
                    const address = results[0].formatted_address;
                    setSelectedAddress(address);
                    if (searchInputRef.current) {
                        searchInputRef.current.value = address;
                    }
                } else {
                    setSelectedAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                }
            });
        }
    }, []);

    const handleAutocompleteLoad = (auto: google.maps.places.Autocomplete) => {
        setAutocomplete(auto);
    };

    const handlePlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const newPos = { lat, lng };

                setMarkerPos(newPos);
                setSelectedAddress(place.formatted_address || place.name || 'Selected Location');

                if (map) {
                    map.panTo(newPos);
                    map.setZoom(15);
                }
            } else {
                console.log('No geometry details available for input: ' + place.name);
            }
        } else {
            console.log('Autocomplete is not loaded yet!');
        }
    };

    const handleConfirm = () => {
        onConfirm(selectedAddress, markerPos.lat, markerPos.lng);
        onClose();
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const userPos = { lat, lng };

                    setMarkerPos(userPos);
                    if (map) {
                        map.panTo(userPos);
                        map.setZoom(15);
                    }

                    // Reverse geocode user position
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: userPos }, (results: any, status: any) => {
                        if (status === 'OK' && results && results[0]) {
                            const address = results[0].formatted_address;
                            setSelectedAddress(address);
                            if (searchInputRef.current) {
                                searchInputRef.current.value = address;
                            }
                        } else {
                            setSelectedAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                        }
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Could not retrieve your current location. Please search for an address.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    if (!isOpen) return null;

    const renderMapContent = () => {
        if (loadError) {
            return (
                <div className="w-full h-[400px] bg-red-50 text-red-800 p-6 rounded-lg text-center flex items-center justify-center border border-red-300">
                    <div>Error loading maps. Check your console for details.</div>
                </div>
            );
        }

        if (!isLoaded) {
            return (
                <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 animate-pulse text-gray-500 rounded-lg">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                        <p className="text-sm font-semibold">Initializing interactive map...</p>
                    </div>
                </div>
            );
        }

        return (
            <>
                {/* Search and Current Location bar */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                        <Autocomplete
                            onLoad={handleAutocompleteLoad}
                            onPlaceChanged={handlePlaceChanged}
                        >
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search for an address, airport, hotel, or station..."
                                defaultValue={selectedAddress}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-sm transition-all"
                            />
                        </Autocomplete>
                        <div className="absolute left-3.5 top-3 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-250 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm flex-shrink-0"
                    >
                        <span>🎯 Use My Location</span>
                    </button>
                </div>

                {/* Google Map */}
                <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-inner">
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={markerPos}
                        zoom={10}
                        onLoad={(m) => setMap(m)}
                        onClick={handleMapClick}
                        options={{
                            disableDefaultUI: false,
                            mapTypeControl: false,
                            streetViewControl: false,
                            fullscreenControl: false,
                        }}
                    >
                        <Marker
                            position={markerPos}
                            title="Starting Location"
                            animation={typeof window !== 'undefined' && window?.google ? window.google.maps.Animation.DROP : undefined}
                        />
                    </GoogleMap>
                </div>
            </>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">

                {/* Modal Header */}
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-950 to-slate-900 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-extrabold">Choose Your Starting Point</h3>
                        <p className="text-xs text-blue-200 mt-0.5">Search or click on the map to set where your trip begins</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-300 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    {renderMapContent()}

                    {/* Selected Address Display */}
                    <div className="bg-slate-50 border border-gray-200 rounded-xl p-3 flex items-start space-x-3 shadow-sm">
                        <span className="text-xl mt-0.5">📍</span>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Selection</p>
                            <p className="text-sm font-bold text-slate-800 leading-tight mt-0.5">{selectedAddress}</p>
                            <p className="text-[11px] text-gray-500 font-mono mt-1">lat: {markerPos.lat.toFixed(5)}, lng: {markerPos.lng.toFixed(5)}</p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-gray-100 bg-slate-50 flex items-center justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-md shadow-emerald-600/20"
                    >
                        Confirm starting point
                    </button>
                </div>

            </div>
        </div>
    );
}
