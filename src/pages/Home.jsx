function Home({ text }) {
  return (
    <section className="hero">
      <h1>{text.title}</h1>
      <p>{text.desc}</p>
    </section>
  )
}

export default Home