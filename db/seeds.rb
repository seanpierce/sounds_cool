class Seed

  def self.begin
    seed = Seed.new
    seed.create_sequences
  end

  def gimme_data
    i = ""
    256.times{|t| r = Random.new; i << r.rand(0..1).to_s}
    i
  end

  def create_sequences
    10.times do |n|
      Sequence.create!(
      title: "Sequence #{n + 1}",
      data: gimme_data,
      width: 16,
      speed: 300
      )
    end
  end

end

Seed.begin
