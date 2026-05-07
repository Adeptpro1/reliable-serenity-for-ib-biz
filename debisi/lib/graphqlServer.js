export async function fetchGraphQL(query, variables = {}, options = {}) {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

  // Extract the string query from Apollo's gql AST node if necessary
  const queryString = typeof query === "string" 
    ? query 
    : query?.loc?.source?.body;

  if (!queryString) {
    console.error("fetchGraphQL: Invalid query provided.", query);
    return { data: null, error: "Invalid query provided" };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify({
        query: queryString,
        variables,
      }),
      // Default to Next.js 15 cache revalidation mechanics
      next: { revalidate: options.revalidate !== undefined ? options.revalidate : 60 },
      ...options.fetchOptions,
    });

    if (!res.ok) {
      console.error(`GraphQL fetch failed with status: ${res.status}`);
      return { data: null, error: `HTTP error! status: ${res.status}` };
    }

    const json = await res.json();
    if (json.errors) {
      console.error("GraphQL errors:", JSON.stringify(json.errors, null, 2));
      return { data: null, errors: json.errors };
    }

    return { data: json.data, errors: null };
  } catch (err) {
    console.error("Server-side GraphQL fetch error:", err);
    // Return null data so the build doesn't crash if backend is down during CI/CD
    return { data: null, error: err.message };
  }
}
