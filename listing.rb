require "json"

postcards = Dir.glob("postcards/*/info.json").map { |postcard|
  base = File.dirname(postcard)
  front = File.join(base, "01.jpg")
  back = File.join(base, "02.jpg")
  name = File.basename(base)
  next if !File.exist?(front) || !File.exist?(back)
  {
    name: name,
    front: front,
    back: back,
    info: postcard
  }
}.compact

open("postcards.json", "w") do |f|
  f.write postcards.to_json
end
