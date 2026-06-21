export const getVenuesService = async () => {
    const venues = [
        {
            id: 1,
            name: "Grant Plaza",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToV67ZP2ZMiqsBouo4C6HMheenlG9S5pE9Bg&s",
            location: {
                city: "Tirur",
                district: "Malappuram"
            },
            price: 50000,
            rating: 4.8,
            capacity: 5000,

            amenities: [
                "Parking",
                "AC",
                "Wifi"
            ],

            isFeatured: false
        },
        {
            id: 2,
            name: "ABC cafe",
            image: "https://thearchitectsdiary.com/wp-content/uploads/2022/03/Cafe-Design-Projected-Rays-Design-TAD-26.jpg",
            location: {
                city: "Fort kochi",
                district: "Eranakulam"
            },
            price: 10000,
            rating: 4.5,
            capacity: 500,

            amenities: [
                "Parking",
                "AC",
                "Wifi"
            ],

            isFeatured: false
        },
        {
            id: 3,
            name: "ABC Beach",
            image: "https://onehorizonproductions.com/wp-content/uploads/2022/08/farmhouse-1.jpg",
            location: {
                city: "Bepur",
                district: "Kozhikode"
            },
            price: 5000,
            rating: 4.7,
            capacity: 100,

            amenities: [
                "Parking",
                "AC",
                "Wifi"
            ],

            isFeatured: false
        },
        {
            id: 4,
            name: "XYZ Hotel",
            image: "https://thearchitectsdiary.com/wp-content/uploads/2022/03/Cafe-Design-Projected-Rays-Design-TAD-26.jpg",
            location: {
                city: "Fort kochi",
                district: "Eranakulam"
            },
            price: 8000,
            rating: 4.8,
            capacity: 500,

            amenities: [
                "Parking",
                "AC",
                "Wifi"
            ],

            isFeatured: false
        },
        {
            id: 5,
            name: "Grant Plaza",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToV67ZP2ZMiqsBouo4C6HMheenlG9S5pE9Bg&s",
            location: {
                city: "Tirur",
                district: "Malappuram"
            },
            price: 50000,
            rating: 4.8,
            capacity: 5000,

            amenities: [
                "Parking",
                "AC",
                "Wifi"
            ],

            isFeatured: false
        },
        {
            id: 6,
            name: "ABC cafe",
            image: "https://thearchitectsdiary.com/wp-content/uploads/2022/03/Cafe-Design-Projected-Rays-Design-TAD-26.jpg",
            location: {
                city: "Fort kochi",
                district: "Eranakulam"
            },
            price: 10000,
            rating: 4.5,
            capacity: 500,

            amenities: [
                "Parking",
                "AC",
                "Wifi"
            ],

            isFeatured: false
        },
        {
            id: 7,
            name: "ABC Beach",
            image: "https://onehorizonproductions.com/wp-content/uploads/2022/08/farmhouse-1.jpg",
            location: {
                city: "Bepur",
                district: "Kozhikode"
            },
            price: 5000,
            rating: 4.7,
            capacity: 100,

            amenities: [
                "Parking",
                "AC",
                "Wifi"
            ],

            isFeatured: false
        },
        {
            id: 8,
            name: "XYZ Hotel",
            image: "https://thearchitectsdiary.com/wp-content/uploads/2022/03/Cafe-Design-Projected-Rays-Design-TAD-26.jpg",
            location: {
                city: "Fort kochi",
                district: "Eranakulam"
            },
            price: 8000,
            rating: 4.8,
            capacity: 500,

            amenities: [
                "Parking",
                "AC",
                "Wifi"
            ],

            isFeatured: false
        }
    ];
    return venues
}