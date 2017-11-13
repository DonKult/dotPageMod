describe('Utils', () => {
	describe('getHostDirsFromURI', () => {
		it('localhost without port', () => {
			let hosts = getHostDirsFromURI('http://localhost/');
			expect(hosts).toEqual(['ALL', 'ALL_http', 'localhost']);
			hosts = getHostDirsFromURI('https://localhost/');
			expect(hosts).toEqual(['ALL', 'ALL_https', 'localhost']);
			hosts = getHostDirsFromURI('ftp://localhost/');
			expect(hosts).toEqual(['ALL_ftp', 'localhost']);
		});
		it('localhost with port', () => {
			let hosts = getHostDirsFromURI('http://localhost:8080/');
			expect(hosts).toEqual(['ALL', 'ALL_http', 'localhost:8080']);
			hosts = getHostDirsFromURI('https://localhost:8080/');
			expect(hosts).toEqual(['ALL', 'ALL_https', 'localhost:8080']);
			hosts = getHostDirsFromURI('ftp://localhost:8080/');
			expect(hosts).toEqual(['ALL_ftp', 'localhost:8080']);
		});
		it('example.org without port', () => {
			let hosts = getHostDirsFromURI('http://example.org/');
			expect(hosts).toEqual(['ALL', 'ALL_http', 'org', 'example.org']);
			hosts = getHostDirsFromURI('https://example.org/');
			expect(hosts).toEqual(['ALL', 'ALL_https', 'org', 'example.org']);
			hosts = getHostDirsFromURI('ftp://example.org/');
			expect(hosts).toEqual(['ALL_ftp', 'org', 'example.org']);
		});
		it('example.org with port', () => {
			let hosts = getHostDirsFromURI('http://example.org:8080/');
			expect(hosts).toEqual(['ALL', 'ALL_http', 'org:8080', 'example.org:8080']);
			hosts = getHostDirsFromURI('https://example.org:8080/');
			expect(hosts).toEqual(['ALL', 'ALL_https', 'org:8080', 'example.org:8080']);
			hosts = getHostDirsFromURI('ftp://example.org:8080/');
			expect(hosts).toEqual(['ALL_ftp', 'org:8080', 'example.org:8080']);
		});
		it('dot.page.mod.example.com', () => {
			let hosts = getHostDirsFromURI('http://dot.page.mod.example.com/');
			expect(hosts).toEqual(['ALL', 'ALL_http', 'com', 'example.com', 'mod.example.com', 'page.mod.example.com', 'dot.page.mod.example.com']);
			hosts = getHostDirsFromURI('https://dot.page.mod.example.com/');
			expect(hosts).toEqual(['ALL', 'ALL_https', 'com', 'example.com', 'mod.example.com', 'page.mod.example.com', 'dot.page.mod.example.com']);
			hosts = getHostDirsFromURI('ftp://dot.page.mod.example.com/');
			expect(hosts).toEqual(['ALL_ftp', 'com', 'example.com', 'mod.example.com', 'page.mod.example.com', 'dot.page.mod.example.com']);
		});
		it('file uri', () => {
			let hosts = getHostDirsFromURI('file:///nonexistent/path/');
			expect(hosts).toEqual(['ALL_file']);
		});
	});
});
