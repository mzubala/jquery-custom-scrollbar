require 'json'

task :default => [:build]

task :build do
  Dir.mkdir("build") unless Dir.exists?("build")
  build_name = "jquery-custom-scrollbar-#{JSON.parse(File.open("custom-scrollbar.jquery.json").read)["version"]}"
  dest = "build/#{build_name}"
  FileUtils.rm_rf(dest) if Dir.exists?(dest)
  Dir.mkdir(dest)
  FileUtils.cp("jquery.custom-scrollbar.css", dest)
  FileUtils.cp("jquery.custom-scrollbar.js", dest)
  system("uglifyjs -m --comments all -o #{dest}/jquery.custom-scrollbar.min.js  #{dest}/jquery.custom-scrollbar.js")
  Dir.chdir("build")
  system("zip -r #{build_name}.zip #{build_name}")
  FileUtils.rm_rf(build_name)
end