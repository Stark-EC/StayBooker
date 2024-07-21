import { createServer, Model, Response } from 'miragejs';
import hotelsData from './data/hotels.json';
import countriesData from './data/countries.json';

export function makeServer({ environment = 'development' } = {}) {
  let server = createServer({
    environment,

    models: {
      user: Model,
      // Define other models here if needed
    },

    seeds(server) {
      server.create('user', {
        id: '1',
        email: 'user1@example.com',
        password: 'password1',
        firstName: 'Phalles',
        lastName: 'Wilson',
        fullName: 'Phalles Wilson',
        phone: '1234567890',
        country: 'Malawi',
        isPhoneVerified: true,
        isEmailVerified: true,
      });
      server.create('user', {
        id: '2',
        email: 'user2@example.com',
        password: 'password2',
        firstName: 'Spark',
        lastName: 'Wilson Spink',
        fullName: 'Spark Wilson Spink',
        phone: '0987654321',
        country: 'Malawi',
        isPhoneVerified: false,
        isEmailVerified: true,
      });
    },

    routes() {
      this.namespace = 'api';

      // Add a logged-in user state to the server
      let loggedInUser = null;

      this.passthrough('http://localhost:4000/*');

      this.get('/users/auth-user', () => {
        if (loggedInUser) {
          return new Response(
            200,
            {},
            {
              errors: [],
              data: {
                isAuthenticated: true,
                userDetails: {
                  id: loggedInUser.id,
                  firstName: loggedInUser.firstName,
                  lastName: loggedInUser.lastName,
                  fullName: loggedInUser.fullName,
                  email: loggedInUser.email,
                  phone: loggedInUser.phone,
                  country: loggedInUser.country,
                  isPhoneVerified: loggedInUser.isPhoneVerified,
                  isEmailVerified: loggedInUser.isEmailVerified,
                },
              },
            }
          );
        } else {
          return new Response(
            200,
            {},
            {
              errors: [],
              data: {
                isAuthenticated: false,
                userDetails: {},
              },
            }
          );
        }
      });

      this.post('/users/login', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const user = schema.users.findBy({ email: attrs.email });

        if (user && user.password === attrs.password) {
          loggedInUser = user;
          return new Response(
            200,
            {},
            {
              data: {
                token:
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBKb2huIiwiaWQiOjEsImlhdCI6MTcwNzU0NTQ5MSwiZXhwIjoxNzA3NTQ5MDkxfQ.dxweIMZGiCuiViov1EfLtu3UwanUMp7TjL85hMDW4rc',
              },
              errors: [],
            }
          );
        } else {
          return new Response(
            404,
            {},
            {
              errors: ['User not found or invalid credentials'],
              data: {},
            }
          );
        }
      });

      this.post('/users/logout', (_schema, _request) => {
        loggedInUser = null;
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              status: 'User logged out successfully',
            },
          }
        );
      });

      this.put('/users/register', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const existingUser = schema.users.findBy({ email: attrs.email });

        if (existingUser) {
          return new Response(
            409,
            {},
            { errors: ['User already exists with that email'] }
          );
        } else {
          // Create a new user
          const newUser = schema.users.create({
            firstName: attrs.firstName,
            lastName: attrs.lastName,
            email: attrs.email,
            phone: attrs.phone,
            password: attrs.password,
          });
          return new Response(
            200,
            {},
            {
              errors: [],
              user: newUser.attrs,
            }
          );
        }
      });

      this.patch('/users/update-profile', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const user = schema.users.findBy({ email: loggedInUser.email });

        if (user) {
          user.update(attrs);
          return new Response(
            200,
            {},
            {
              errors: [],
              data: {
                status: 'Profile updated successfully',
              },
            }
          );
        } else {
          return new Response(
            404,
            {},
            {
              errors: ['User not found'],
              data: {},
            }
          );
        }
      });

      this.get('/users/bookings', () => {
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: [
                {
                  bookingId: 'BKG123',
                  bookingDate: '2024-01-10',
                  hotelName: 'Seaside Resort',
                  checkInDate: '2024-01-20',
                  checkOutDate: '2024-01-25',
                  totalFare: 'MWK14,500',
                },
                {
                  bookingId: 'BKG124',
                  bookingDate: '2024-01-03',
                  hotelName: 'Mountain Retreat',
                  checkInDate: '2024-02-15',
                  checkOutDate: '2024-02-20',
                  totalFare: 'MWK5,890',
                },
                {
                  bookingId: 'BKG125',
                  bookingDate: '2024-01-11',
                  hotelName: 'City Central Hotel',
                  checkInDate: '2024-03-01',
                  checkOutDate: '2024-03-05',
                  totalFare: 'MWK21,700',
                },
              ],
            },
          }
        );
      });

      this.get('/users/payment-methods', () => {
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: [
                {
                  id: '1',
                  cardType: 'Visa',
                  cardNumber: '**** **** **** 1234',
                  expiryDate: '08/26',
                },
                {
                  id: '2',
                  cardType: 'MasterCard',
                  cardNumber: '**** **** **** 5678',
                  expiryDate: '07/24',
                },
                {
                  id: '3',
                  cardType: 'American Express',
                  cardNumber: '**** **** **** 9012',
                  expiryDate: '05/25',
                },
              ],
            },
          }
        );
      });

      this.get('/hotel/:hotelId/booking/enquiry', (_schema, request) => {
        let hotelId = request.params.hotelId;
        const result = hotelsData.find((hotel) => {
          return Number(hotel.hotelCode) === Number(hotelId);
        });
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              name: result.title,
              cancellationPolicy: 'Free cancellation 1 day prior to stay',
              checkInTime: '12:00 PM',
              checkOutTime: '10:00 AM',
              currentNightRate: result.price,
              maxGuestsAllowed: 5,
              maxRoomsAllowedPerGuest: 3,
            },
          }
        );
      });

      this.get('/popularDestinations', () => {
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: [
                {
                  code: 1211,
                  name: 'Lilongwe',
                  imageUrl: '/images/cities/mumbai.jpg',
                },
                {
                  code: 1212,
                  name: 'Blantyre',
                  imageUrl: '/images/cities/bangkok.jpg',
                },
                {
                  code: 1213,
                  name: 'Zomba',
                  imageUrl: '/images/cities/london.jpg',
                },
                {
                  code: 1214,
                  name: 'Mzuzu',
                  imageUrl: '/images/cities/dubai.jpg',
                },
                {
                  code: 1215,
                  name: 'Mangochi',
                  imageUrl: '/images/cities/oslo.jpg',
                },
              ],
            },
          }
        );
      });

      this.get('/nearbyHotels', () => {
        const hotels = hotelsData.filter((hotel) => {
          return hotel.city === 'lilongwe';
        });
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: hotels,
            },
          }
        );
      });

      this.get('/hotel/:hotelId', (_schema, request) => {
        let hotelId = request.params.hotelId;
        const description = [
          'A serene stay awaits at our plush hotel, offering a blend of luxury and comfort with top-notch amenities.',
          'Experience the pinnacle of elegance in our beautifully designed rooms with stunning cityscape views.',
          'Indulge in gastronomic delights at our in-house restaurants, featuring local and international cuisines.',
          'Unwind in our state-of-the-art spa and wellness center, a perfect retreat for the senses.',
          'Located in the heart of the city, our hotel is the ideal base for both leisure and business travelers.',
        ];

        const result = hotelsData.find((hotel) => {
          return Number(hotel.hotelCode) === Number(hotelId);
        });

        result.description = description;

        return new Response(
          200,
          {},
          {
            errors: [],
            data: result,
          }
        );
      });

      // 
      // this.get('/hotel/:hotelId', (schema, request) => {
      //   let hotelId = request.params.hotelId;
        
      //   // Find the hotel data from hotelsData based on hotelId
      //   const result = hotelsData.find((hotel) => {
      //     return Number(hotel.hotelCode) === Number(hotelId);
      //   });
      
      //   // If hotel found, include the description field
      //   if (result) {
      //     // Replace the static description with dynamic descriptions fetched from hotelsData
      //     if (result.hotelCode === '71222') {
      //       const description = [
      //         'A serene stay awaits at our plush hotel, offering a blend of luxury and comfort with top-notch amenities.',
      //         'Experience the pinnacle of elegance in our beautifully designed rooms with stunning cityscape views.',
      //         'Indulge in gastronomic delights at our in-house restaurants, featuring local and international cuisines.',
      //         'Unwind in our state-of-the-art spa and wellness center, a perfect retreat for the senses.',
      //         'Located in the heart of the city, our hotel is the ideal base for both leisure and business travelers.',
      //       ];
      
      //       result.description = description;
      //     } else if (result.hotelCode === '71223') {
      //       const description = [
      //         'Escape to a tranquil oasis in the heart of the bustling city, where modern comforts meet traditional hospitality.',
      //         'Enjoy sweeping views of the city skyline from our elegantly appointed rooms and suites.',
      //         'Savor a variety of culinary delights at our restaurants, catering to every palate with global flavors.',
      //         'Rejuvenate your senses at our spa, offering a range of treatments and therapies.',
      //         'Conveniently located near major attractions, our hotel is your gateway to a memorable stay.',
      //       ];
      
      //       result.description = description;
      //     }
      //     // Add more else if conditions for other hotel codes if needed
      
      //     return new Response(
      //       200,
      //       {},
      //       {
      //         errors: [],
      //         data: result,
      //       }
      //     );
      //   } else {
      //     return new Response(
      //       404,
      //       {},
      //       {
      //         errors: ['Hotel not found'],
      //         data: {},
      //       }
      //     );
      //   }
      // });
      
      // 

      this.get('/hotel/:hotelId/reviews', (_schema, request) => {
        // hardcoded hotelId for now so to not add mock for each hotel
        const currentPage = request.queryParams.currentPage;
        let hotelId = 71222;
        const result = hotelsData.find((hotel) => {
          return Number(hotel.hotelCode) === Number(hotelId);
        });
        const totalRatings = result.reviews.data.reduce(
          (acc, review) => acc + review.rating,
          0
        );
        const initialCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        const starCounts = result.reviews.data.reduce((acc, review) => {
          const ratingKey = Math.floor(review.rating).toString();
          if (acc.hasOwnProperty(ratingKey)) {
            acc[ratingKey]++;
          }
          return acc;
        }, initialCounts);

        const metadata = {
          totalReviews: result.reviews.data.length,
          averageRating: (totalRatings / result.reviews.data.length).toFixed(1),
          starCounts,
        };

        //paging
        const pageSize = 5;
        const paging = {
          currentPage: currentPage || 1,
          totalPages:
            Math.floor((result.reviews.data.length - 1) / pageSize) + 1,
          pageSize,
        };

        // paginated data
        const data = result.reviews.data.slice(
          (paging.currentPage - 1) * pageSize,
          paging.currentPage * pageSize
        );

        return {
          errors: [],
          data: {
            elements: data,
          },
          metadata,
          paging,
        };
      });

      this.put('/hotel/add-review', (schema, request) => {
        // const attrs = JSON.parse(request.requestBody);
        // const hotelId = attrs.hotelId;
        // const review = attrs.review;
        // const rating = attrs.rating;
        // const user = schema.users.findBy({ email: attrs.email });
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              status: 'Review added successfully',
            },
          }
        );
      });

      this.get('/hotels', (_schema, request) => {
        let currentPage = request.queryParams.currentPage;
        const filters = request.queryParams.filters;
        const parsedFilters = JSON.parse(filters);
        const parsedAdvancedFilters = JSON.parse(
          request.queryParams.advancedFilters
        );
        const city = parsedFilters.city;
        const star_ratings = parsedFilters.star_ratings;
        const priceFilter = parsedFilters.priceFilter;
        const sortByFilter = parsedAdvancedFilters.find((filter) => {
          return filter.sortBy;
        });

        const filteredResults = hotelsData.filter((hotel) => {
          const hotelRating = parseFloat(hotel.ratings);
          const hotelPrice = parseFloat(hotel.price.replace(',', ''));
          const isCityMatch = city === '' || hotel.city === city;
          const isPriceMatch =
            !priceFilter ||
            (hotelPrice >= parseFloat(priceFilter.start) &&
              hotelPrice <= parseFloat(priceFilter.end));

          if (isCityMatch && isPriceMatch) {
            if (star_ratings && star_ratings.length > 0) {
              return star_ratings.some((selectedRating) => {
                const selected = parseFloat(selectedRating);
                const range = 0.5;
                return Math.abs(hotelRating - selected) <= range;
              });
            } else {
              // If no star ratings are provided, return all hotels for the city (or all cities if city is empty)
              return true;
            }
          }
          return false;
        });

        if (sortByFilter) {
          const sortType = sortByFilter.sortBy;
          if (sortType === 'priceLowToHigh') {
            filteredResults.sort((a, b) => {
              return a.price - b.price;
            });
          }
          if (sortType === 'priceHighToLow') {
            filteredResults.sort((a, b) => {
              return b.price - a.price;
            });
          }
        }

        // pagination config
        const pageSize = 6;
        const totalPages =
          Math.floor((filteredResults.length - 1) / pageSize) + 1;
        currentPage = currentPage > totalPages ? totalPages : currentPage;
        const paging = {
          currentPage: currentPage || 1,
          totalPages: Math.floor((filteredResults.length - 1) / pageSize) + 1,
          pageSize,
        };

        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: filteredResults.slice(
                (paging.currentPage - 1) * pageSize,
                paging.currentPage * pageSize
              ),
            },
            metadata: {
              totalResults: filteredResults.length,
            },
            paging,
          }
        );
      });

      this.get('/availableCities', () => {
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: ['lilongwe', 'bangalore', 'mumbai', 'blantyre', 'mzuzu', 'mangochi', 'zomba'],
            },
          }
        );
      });

      this.get('/hotels/verticalFilters', () => {
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: [
                {
                  filterId: 'star_ratings',
                  title: 'Star ratings',
                  filters: [
                    {
                      id: '5_star_rating',
                      title: '5 Star',
                      value: '5',
                    },
                    {
                      id: '4_star_rating',
                      title: '4 Star',
                      value: '4',
                    },
                    {
                      id: '3_star_rating',
                      title: '3 Star',
                      value: '3',
                    },
                  ],
                },
                {
                  filterId: 'propety_type',
                  title: 'Property type',
                  filters: [
                    {
                      id: 'prop_type_hotel',
                      title: 'Hotel',
                    },
                    {
                      id: 'prop_type_apartment',
                      title: 'Apartment',
                    },
                    {
                      id: 'prop_type_villa',
                      title: 'Villa',
                    },
                  ],
                },
              ],
            },
          }
        );
      });

      // this.post('/payments/confirmation', () => {
      //   return new Promise((resolve) => {
      //     setTimeout(() => {
      //       resolve(
      //         new Response(
      //           200,
      //           {},
      //           {
      //             errors: [],
      //             data: {
      //               status: 'Payment successful',
      //               bookingDetails: [
      //                 {
      //                   label: 'Booking ID',
      //                   value: 'BKG123',
      //                 },
      //                 {
      //                   label: 'Booking Date',
      //                   value: '2024-01-10',
      //                 },
      //                 {
      //                   label: 'Hotel Name',
      //                   value: 'Seaside Resort',
      //                 },
      //                 {
      //                   label: 'Check-in Date',
      //                   value: '2024-01-20',
      //                 },
      //                 {
      //                   label: 'Check-out Date',
      //                   value: '2024-01-25',
      //                 },
      //                 {
      //                   label: 'Total Fare',
      //                   value: 'MWK14,500',
      //                 },
      //               ],
      //             },
      //           }
      //         )
      //       );
      //     }, 6000); // 2000 milliseconds = 2 seconds
      //   });
      // });

      // this.post('/payments/confirmation', () => {
      //   // Function to get current date in YYYY-MM-DD format
      //   const getCurrentDate = () => {
      //     const now = new Date();
      //     const year = now.getFullYear();
      //     let month = now.getMonth() + 1;
      //     let day = now.getDate();
      //     if (month < 10) {
      //       month = `0${month}`;
      //     }
      //     if (day < 10) {
      //       day = `0${day}`;
      //     }
      //     return `${year}-${month}-${day}`;
      //   };
      
      //   return new Promise((resolve) => {
      //     setTimeout(() => {
      //       resolve(
      //         new Response(
      //           200,
      //           {},
      //           {
      //             errors: [],
      //             data: {
      //               status: 'Payment successful',
      //               bookingDetails: [
      //                 {
      //                   label: 'Booking ID',
      //                   value: 'BKG123',
      //                 },
      //                 {
      //                   label: 'Booking Date',
      //                   value: getCurrentDate(), // Set current date dynamically
      //                 },
      //                 {
      //                   label: 'Hotel Name',
      //                   value: 'Seaside Resort',
      //                 },
      //                 {
      //                   label: 'Check-in Date',
      //                   value: getCurrentDate(), // Set current date dynamically
      //                 },
      //                 {
      //                   label: 'Check-out Date',
      //                   value: getCurrentDate(), // Set current date dynamically
      //                 },
      //                 {
      //                   label: 'Total Fare',
      //                   value: 'MWK14,500',
      //                 },
      //               ],
      //             },
      //           }
      //         )
      //       );
      //     }, 6000); // Delay response by 6 seconds (6000 milliseconds)
      //   });
      // });
      this.post('/payments/confirmation', () => {
        // Function to get current date in YYYY-MM-DD format
        const getCurrentDate = () => {
          const now = new Date();
          const year = now.getFullYear();
          let month = now.getMonth() + 1;
          let day = now.getDate();
          if (month < 10) {
            month = `0${month}`;
          }
          if (day < 10) {
            day = `0${day}`;
          }
          return `${year}-${month}-${day}`;
        };
      
        // Example: Setting a checkout date two days after check-in
        const calculateCheckOutDate = (checkInDate) => {
          const dateParts = checkInDate.split('-');
          const checkIn = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
          const checkOut = new Date(checkIn);
          checkOut.setDate(checkIn.getDate() + 2); // Assuming two-day stay
          const year = checkOut.getFullYear();
          let month = checkOut.getMonth() + 1;
          let day = checkOut.getDate();
          if (month < 10) {
            month = `0${month}`;
          }
          if (day < 10) {
            day = `0${day}`;
          }
          return `${year}-${month}-${day}`;
        };
      
        return new Promise((resolve) => {
          setTimeout(() => {
            const checkInDate = getCurrentDate(); // Get current date dynamically
            const checkOutDate = calculateCheckOutDate(checkInDate); // Calculate check-out date
      
            resolve(
              new Response(
                200,
                {},
                {
                  errors: [],
                  data: {
                    status: 'Payment successful',
                    bookingDetails: [
                      {
                        label: 'Booking ID',
                        value: 'BKG123',
                      },
                      {
                        label: 'Booking Date',
                        value: getCurrentDate(), // Set current date dynamically
                      },
                      {
                        label: 'Hotel Name',
                        value: 'Seaside Resort',
                      },
                      {
                        label: 'Check-in Date',
                        value: checkInDate,
                      },
                      {
                        label: 'Check-out Date',
                        value: checkOutDate,
                      },
                      {
                        label: 'Total Fare',
                        value: 'MWK14,500',
                      },
                    ],
                  },
                }
              )
            );
          }, 6000); // Delay response by 6 seconds (6000 milliseconds)
        });
      });
      
      
      
      this.get('/misc/countries', () => {
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: countriesData,
            },
          }
        );
      });
    },
  });

  return server;
}
