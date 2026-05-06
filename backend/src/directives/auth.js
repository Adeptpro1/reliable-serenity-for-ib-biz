// import { GraphQLDirective, defaultFieldResolver } from 'graphql';
// import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';

// export function authDirective(directiveName) {
//   return {
//     authDirectiveType: new GraphQLDirective({
//       name: directiveName,
//       locations: ['FIELD_DEFINITION'],
//       args: {
//         role: { type: 'String' },
//       },
//     }),
//     authDirectiveTransformer: (schema) =>
//       mapSchema(schema, {
//         [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
//           const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
//           if (directive) {
//             const { resolve = defaultFieldResolver } = fieldConfig;
//             const { role } = directive;

//             fieldConfig.resolve = async function (...args) {
//               const [, , context] = args;

//               if (!context.user) {
//                 throw new Error('Authentication required');
//               }
         
//               if (role && context.user.role !== role) {
//                 throw new Error(`Requires ${role} role`);
//               }

//               return resolve.apply(this, args);
//             };
//           }
//           return fieldConfig;
//         },
//       }),
//   };
// }

import { GraphQLDirective, defaultFieldResolver, GraphQLList, GraphQLString } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';

export function authDirective(directiveName) {
  return {
    authDirectiveType: new GraphQLDirective({
      name: directiveName,
      locations: ['FIELD_DEFINITION'],
      args: {
        roles: { type: new GraphQLList(GraphQLString) }, // 👈 allow multiple roles
      },
    }),
    authDirectiveTransformer: (schema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
          if (directive) {
            const { resolve = defaultFieldResolver } = fieldConfig;
            const { roles } = directive; // now an array

            fieldConfig.resolve = async function (...args) {
              const [, , context] = args;



                // Skip authentication for IntrospectionQuery only
                if (context.operationName === 'IntrospectionQuery') {
                  return resolve.apply(this, args);
                }

                if (!context.user) {
                  throw new Error('Authentication required');
                }

              if (roles && roles.length > 0 && !roles.includes(context.user.role)) {
                throw new Error(`Requires one of the following roles: ${roles.join(', ')}`);
              }

              return resolve.apply(this, args);
            };
          }
          return fieldConfig;
        },
      }),
  };
}

